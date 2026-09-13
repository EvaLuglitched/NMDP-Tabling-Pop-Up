// The .js extension is REQUIRED and must not be removed.
//
// This project is ESM ("type": "module"), and Vercel ships the API function as
// separate transpiled files rather than one bundle. A bare '../server' makes
// Node resolve the sibling DIRECTORY server/ instead of the file server.ts,
// and Node's ESM loader refuses directory imports:
//
//   ERR_UNSUPPORTED_DIR_IMPORT: Directory import '/var/task/server'
//
// which crashed the function on every single request (FUNCTION_INVOCATION_FAILED)
// before any route could run. The explicit extension names the file unambiguously.
import app from '../server.js';

export default app;
