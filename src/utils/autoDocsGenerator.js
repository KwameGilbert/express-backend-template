/**
 * @deprecated This file is deprecated. Use routeDoc.js instead.
 *
 * The functionality has been consolidated into:
 * - src/utils/routeDoc.js - Route documentation helpers (api.get, api.post, etc.)
 * - src/utils/zodToOpenAPI.js - Zod to OpenAPI schema conversion
 *
 * This file is kept for backward compatibility but will be removed in a future version.
 */

export { api, getDoc, postDoc, putDoc, patchDoc, deleteDoc, generateDocs } from './routeDoc.js';

// Re-export for backward compatibility
import routeDoc from './routeDoc.js';
export const AutoDocsGenerator = {
  route: routeDoc.api.post, // Deprecated
  doc: (config) => routeDoc.api[config.method?.toLowerCase() || 'get'](config.path, config),
  generatePaths: routeDoc.generateDocs,
};

export const doc = AutoDocsGenerator.doc;
export default AutoDocsGenerator;
