export interface IAccessCodeVerifier {
  /** Returns true when code matches the stored hash. Timing-safe. */
  verify(code: string): Promise<boolean>;
}
