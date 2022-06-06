import colors from 'colors';

export class ServerError extends Error {
  /**
   * @param {string} message
   * @param {number} code
   */
  constructor(message, code = 500) {
    super(message);
    this.name = 'ServerError';
    this.stack = this.cleanStacktrace(this.stack);
    this.code = code;
  }

  /**
   * @private
   * Scrubs references to node_modules from stacktrace to make it more readable
   * @param {string} stack 
   */
  cleanStacktrace(stack) {
    const newStack = stack.split(/\n/g).filter((line, i) => i == 0 || !line.match(/node_modules/));
    return newStack.join('\n');
  }
}

/**
 * "Zips" together 2 arrays in an alternating fashion.  
 * e.g. `zip([1,3], [2,4]) == [1,2,3,4]`
 * @param {any[]} a 
 * @param {any[]} b 
 * @returns {any[]}
 */
export function zip(a, b) { 
  return (a.length ? [a[0], ...zip(b, a.slice(1))] : b)
}

/**
 * Logs an error to the console in red
 * @param {*} message
 * @param  {...any} optionalParams 
 */
export function error(message = '', ...optionalParams) {
  console.error(colors.red(message), ...optionalParams.map(p => colors.red(p)));
}

/**
 * Logs an error to the console in red
 * @param {*} message
 * @param  {...any} optionalParams 
 */
export function warn(message = '', ...optionalParams) {
  console.warn(colors.yellow(message), ...optionalParams.map(p => colors.yellow(p)));
}