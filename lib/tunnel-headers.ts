/**
 * Headers every backend call carries.
 *
 * Both APIs sit behind a public tunnel. On ngrok's free tier a request whose
 * User-Agent looks like a browser is answered with an HTML interstitial instead
 * of being proxied, so `fetch` receives markup where it expects JSON and
 * `res.json()` throws. It reads exactly like a CORS or backend failure and is
 * neither. This header opts out of that page.
 *
 * Harmless off ngrok: an unrecognised request header is ignored. Both backends
 * allow every request header, so no preflight change is needed.
 */
export const TUNNEL_HEADERS: Record<string, string> = {
  "ngrok-skip-browser-warning": "true",
};
