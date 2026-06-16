export interface JwtPayload {
  email: string;
  sub: string; // User ID
  role: string;
}
