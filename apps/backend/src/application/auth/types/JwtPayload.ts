export interface JwtPayload {
  email: string | null;
  walletAddress: string;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
}

export enum UserRole {
  USER = 'USER',
  STREAMER = 'STREAMER',
  ADMIN = 'ADMIN',
}
