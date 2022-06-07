import pg from 'pg';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { zip } from '../utils/utils.js';
import colors from 'colors';
import fs from 'fs/promises';

// Load config
const __dirname = dirname(fileURLToPath(import.meta.url));
const _config = JSON.parse(await fs.readFile(path.join(__dirname, './models.config.json')));

// Database schema: https://app.dbdesigner.net/designer/schema/532196
// Initialize pool
const pool = new pg.Pool({
  connectionString: _config.databaseUri
});

/**
 * Queries the database
 * @param {string} queryString
 * @param {any[]} params
 * @param {boolean} log Whether or not to log the query to the console. Default `false`
 */
export function query(queryString, params, log = false) {
  if (log) console.log('Running query:\n', colors.cyan(queryString));
  return pool.query(queryString, params);
}

/**
 * Queries the database and returns the first result or null
 * @param {string} queryString
 * @param {any[]} params
 * @param {boolean} log Whether or not to log the query to the console. Default `false`
 * @returns {Promise<any?>}
 */
export function queryOne(queryString, params, log = false) {
  return query(queryString, params, log).then((result) => result.rows[0] || null);
}

/**
 * Tagged template function which removes excess indentation from a multiline template literal
 * @param {TemplateStringsArray} strings 
 * @param  {...any[]} variables 
 */
export function sql(strings, ...variables) {
  const str = zip(strings, variables).join('');
  const lines = str.split(/\n/g);
  if (lines.length > 2) {
    const indent_0 = lines[1].search(/\S|$/m);
    const pattern = new RegExp(`^\\s{0,${indent_0}}`, 'm');
    for (let l = 1; l < lines.length; l++) {
      lines[l] = lines[l].replace(pattern, '');
    }
  }
  if (lines[0].trim() == '') lines.splice(0, 1);
  if (lines[lines.length - 1].trim() == '') lines.splice(lines.length - 1, 1);
    
  return lines.join('\n');
}