import pg from 'pg';
import { zip } from '../utils/utils';
import colors from 'colors';
import CONFIG from './model.config.json';
import bcrypt from 'bcrypt';

// Database schema: https://app.dbdesigner.net/designer/schema/532865
// Initialize pool
const pool = new pg.Pool({
  connectionString: CONFIG.databaseUri
});

/**
 * Queries the database
 * @param log Whether or not to log the query to the console. Default `false`
 */
export function query(queryString: string, params?: unknown[], log = false) {
  if (log) console.log('Running query:\n', colors.cyan(queryString));

  // Convert any NaN values to null to avoid parameterization issues
  const safeParams = params?.map((p) => Number.isNaN(p) ? null : p);

  return pool.query(queryString, safeParams);
}

/**
 * Queries the database and returns the first result or null
 * @param log Whether or not to log the query to the console. Default `false`
 */
export const queryOne = (queryString: string, params?: unknown[], log = false) => {
  return query(queryString, params, log).then((result) => result.rows[0] || null);
}

/** Tagged template function which removes excess indentation from a multiline template literal*/
export function sql(strings: TemplateStringsArray, ...variables: any[]) {
  const str = zip(strings as unknown as unknown[], variables).join('');
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

export async function encrypt(text: string) {
  return bcrypt.hash(text, CONFIG.saltRounds);
}

export async function compareHash(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}

export const ERROR_CODES = {
  DUPLICATE_KEY: 23505
};

export type Model = Record<string, (...args: any[]) => Promise<unknown>>;
