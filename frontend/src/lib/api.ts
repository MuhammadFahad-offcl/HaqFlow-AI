/**
 * Backward-compatibility shim.
 *
 * Every screen originally imported `{ api } from "../../lib/api"`. Rather
 * than touch all eight screen files, the real client now lives in
 * `services/api.ts` (real backend calls + mock fallback) and this file just
 * re-exports it under the same name/path. New code should import directly
 * from `services/api` instead.
 */
export { api } from '../services/api';
