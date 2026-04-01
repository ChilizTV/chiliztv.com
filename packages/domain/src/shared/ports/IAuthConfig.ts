export interface IAuthConfig {
  readonly jwtSecret: string;
  readonly jwtIssuer: string;
  readonly jwtExpiresIn: string;
}
