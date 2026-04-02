import { injectable } from 'tsyringe';
import { IAuthConfig } from '@chiliztv/domain/shared/ports/IAuthConfig';
import { env } from './environment';

@injectable()
export class AuthConfigService implements IAuthConfig {
    readonly jwtSecret: string;
    readonly jwtIssuer: string;
    readonly jwtExpiresIn: string;

    constructor() {
        this.jwtSecret    = env.JWT_SECRET;
        this.jwtIssuer    = env.JWT_ISSUER;
        this.jwtExpiresIn = env.JWT_EXPIRY;
    }
}
