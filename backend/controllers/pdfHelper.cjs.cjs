// backend/controllers/pdfHelper.cjs
// CommonJS wrapper — solves ESM/CJS interop issue with pdf-parse
const pdfParse = require('pdf-parse');
module.exports = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse);
