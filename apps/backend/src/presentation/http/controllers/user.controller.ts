import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { supabaseClient as supabase } from '../../../infrastructure/database/supabase/client';
import { logger } from '../../../infrastructure/logging/logger';
import { ResolveUserProfileUseCase } from '../../../application/users/use-cases/ResolveUserProfileUseCase';
import { ResolveUserProfilesBatchUseCase } from '../../../application/users/use-cases/ResolveUserProfilesBatchUseCase';
import { UpsertUserProfileUseCase } from '../../../application/users/use-cases/UpsertUserProfileUseCase';
import type { UserProfile } from '@chiliztv/domain/users/entities/UserProfile';

const BUCKET = 'avatars';
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXT_BY_MIME: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

interface AuthedRequest extends Request {
    file?: Express.Multer.File;
}

@injectable()
export class UserController {
    constructor(
        @inject(ResolveUserProfileUseCase)
        private readonly resolveProfile: ResolveUserProfileUseCase,
        @inject(ResolveUserProfilesBatchUseCase)
        private readonly resolveProfilesBatch: ResolveUserProfilesBatchUseCase,
        @inject(UpsertUserProfileUseCase)
        private readonly upsertProfile: UpsertUserProfileUseCase,
    ) {}

    /** GET /users/by-wallet/:address — resolves a wallet to its display profile. */
    async getProfileByWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { address } = req.params;
            const profile = await this.resolveProfile.execute(address);
            res.json({ success: true, profile: serializeProfile(profile) });
        } catch (error) {
            next(error);
        }
    }

    /** POST /users/by-wallets — batch resolve. Body: `{ addresses: string[] }`. */
    async getProfilesByWallets(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const addresses = Array.isArray(req.body?.addresses) ? req.body.addresses : [];
            if (addresses.length === 0) {
                res.json({ success: true, profiles: {} });
                return;
            }
            const profiles = await this.resolveProfilesBatch.execute(addresses);
            const serialized: Record<string, ReturnType<typeof serializeProfile>> = {};
            for (const [wallet, profile] of profiles) {
                serialized[wallet] = serializeProfile(profile);
            }
            res.json({ success: true, profiles: serialized });
        } catch (error) {
            next(error);
        }
    }

    /** POST /users/profile — upsert from the authenticated session (Dynamic Labs). */
    async upsertOwnProfile(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const wallet = req.user?.walletAddress;
            if (!wallet) {
                res.status(401).json({ success: false, error: 'Wallet not derivable from token' });
                return;
            }
            const { username, avatarUrl } = (req.body ?? {}) as {
                username?: string | null;
                avatarUrl?: string | null;
            };
            const profile = await this.upsertProfile.execute({
                walletAddress: wallet,
                username: username ?? null,
                avatarUrl: avatarUrl ?? null,
            });
            res.json({ success: true, profile: serializeProfile(profile) });
        } catch (error) {
            next(error);
        }
    }

    /** POST /users/avatar — multipart `file` field. Returns the public URL. */
    async uploadAvatar(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const wallet = req.user?.walletAddress;
            if (!wallet) {
                res.status(401).json({ success: false, error: 'Wallet not derivable from token' });
                return;
            }
            const file = req.file;
            if (!file) {
                res.status(400).json({ success: false, error: 'No file uploaded (expected multipart field "file")' });
                return;
            }
            if (!ALLOWED_MIME.has(file.mimetype)) {
                res.status(400).json({ success: false, error: 'Only JPEG / PNG / WEBP accepted' });
                return;
            }

            const ext = EXT_BY_MIME[file.mimetype];
            const path = `${wallet.toLowerCase()}.${ext}`;

            let uploadError: { message: string; statusCode?: string } | null = null;
            try {
                const { error } = await supabase.storage
                    .from(BUCKET)
                    .upload(path, file.buffer, {
                        contentType: file.mimetype,
                        upsert: true,
                        // Short TTL so re-uploads at the same path (`{wallet}.{ext}`)
                        // become visible within a minute instead of the 1h default.
                        cacheControl: '60',
                    });
                uploadError = error;
            } catch (sdkError) {
                // supabase-js shouldn't throw, but if the URL/key is misconfigured it can.
                logger.error('Avatar upload threw inside supabase-js', {
                    wallet,
                    error: sdkError instanceof Error ? sdkError.message : String(sdkError),
                });
                res.status(500).json({
                    success: false,
                    error: 'Storage SDK error — check SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY',
                    details: sdkError instanceof Error ? sdkError.message : String(sdkError),
                });
                return;
            }

            if (uploadError) {
                // Bubble Supabase's actual error to the client so the user knows whether
                // it's a missing bucket / RLS / size issue instead of a generic 500.
                logger.warn('Avatar upload rejected by Supabase', {
                    wallet,
                    bucket: BUCKET,
                    path,
                    error: uploadError.message,
                    statusCode: uploadError.statusCode,
                });
                res.status(500).json({
                    success: false,
                    error: 'Upload rejected by storage',
                    details: uploadError.message,
                });
                return;
            }

            const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
            // Clean URL only — Dynamic's metadata validator rejects values with
            // query strings. The `version` field below lets the client append
            // its own cache-buster at render time.
            const url = urlData.publicUrl;
            const version = Date.now();

            // Mirror the new URL into `users.avatar_url` so server-side
            // consumers (chat events, dashboard list views) pick it up.
            // Failure here is non-fatal — the upload itself succeeded.
            try {
                await this.upsertProfile.execute({
                    walletAddress: wallet,
                    username: null,
                    avatarUrl: url,
                });
            } catch (mirrorErr) {
                logger.warn('Avatar URL mirror to users table failed', {
                    wallet,
                    error: mirrorErr instanceof Error ? mirrorErr.message : String(mirrorErr),
                });
            }

            res.json({ success: true, url, version, timestamp: version });
        } catch (error) {
            logger.error('Avatar upload unexpected error', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            next(error);
        }
    }

    /** DELETE /users/avatar — removes whichever extension exists. */
    async deleteAvatar(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const wallet = req.user?.walletAddress;
            if (!wallet) {
                res.status(401).json({ success: false, error: 'Wallet not derivable from token' });
                return;
            }
            const paths = Object.values(EXT_BY_MIME).map((ext) => `${wallet.toLowerCase()}.${ext}`);
            const { error } = await supabase.storage.from(BUCKET).remove(paths);
            if (error) {
                logger.warn('Avatar delete failed', { wallet, error: error.message });
                res.status(500).json({ success: false, error: 'Delete failed' });
                return;
            }
            // Clear `users.avatar_url` as well — keep storage and cache in sync.
            try {
                await this.upsertProfile.execute({
                    walletAddress: wallet,
                    username: null,
                    avatarUrl: null,
                });
            } catch (mirrorErr) {
                logger.warn('Avatar URL clear in users table failed', {
                    wallet,
                    error: mirrorErr instanceof Error ? mirrorErr.message : String(mirrorErr),
                });
            }
            res.json({ success: true, timestamp: Date.now() });
        } catch (error) {
            next(error);
        }
    }
}

function serializeProfile(profile: UserProfile): {
    walletAddress: string;
    username: string | null;
    avatarUrl: string | null;
    updatedAt: string;
} {
    return {
        walletAddress: profile.walletAddress,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        updatedAt: profile.updatedAt.toISOString(),
    };
}
