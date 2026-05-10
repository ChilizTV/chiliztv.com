import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import multer from 'multer';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = container.resolve(UserController);

// 2 MB max — enough for a 1 MP JPEG, blocks data-URL spam.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// Surface multer errors as structured 400s instead of letting them hit the
// generic global handler which masks the real reason ("File too large", etc.).
const handleMulter = (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
        if (!err) return next();
        if (err instanceof multer.MulterError) {
            res.status(400).json({ success: false, error: err.code, details: err.message });
            return;
        }
        res.status(400).json({
            success: false,
            error: 'Upload parse failed',
            details: err instanceof Error ? err.message : String(err),
        });
    });
};

router.post('/avatar', handleMulter, userController.uploadAvatar.bind(userController));
router.delete('/avatar', userController.deleteAvatar.bind(userController));

// Profile read paths — public (no auth required, the data is display-only).
router.get('/by-wallet/:address', userController.getProfileByWallet.bind(userController));
router.post('/by-wallets', userController.getProfilesByWallets.bind(userController));

// Profile write — auth required (the auth middleware upstream populates
// `req.user.walletAddress`; the controller never trusts the body's wallet).
router.post('/profile', userController.upsertOwnProfile.bind(userController));

export { router as userRoutes };
