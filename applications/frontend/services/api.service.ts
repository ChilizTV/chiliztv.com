/**
 * @notice Legacy API service - baseURL only
 * @dev Used by stream services (stream-client, stream-viewer)
 * @dev For new code, use lib/api/client.ts instead
 */
export class ApiService {
  static readonly baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}
