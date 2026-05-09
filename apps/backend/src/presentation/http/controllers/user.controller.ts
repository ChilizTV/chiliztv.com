import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../../infrastructure/database/supabase/client';
import { logger } from '../../../infrastructure/logging/logger';

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
            res.json({ success: true, timestamp: Date.now() });
        } catch (error) {
            next(error);
        }
    }
}
