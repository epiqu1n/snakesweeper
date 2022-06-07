import colors from 'colors';

/** @typedef {import("express").Request} Request */

export class CustomError extends Error {
  /**
   * @param {string} message
   * @param {string} className
   * @param {number} statusCode
   */
  constructor(message, className = 'CustomError', statusCode = 500) {
    super(message);
    this.name = className;
    this.stack = this.cleanStacktrace(this.stack);
    this.statusCode = statusCode;
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

export class ServerError extends CustomError {
  /**
   * @param {string} message
   * @param {number} statusCode
   */
  constructor(message, statusCode = 500) {
    super(message, 'ServerError', statusCode);
  }
}

export class ClientError extends CustomError {
  /**
   * @param {string} message
   * @param {number} statusCode
   */
  constructor(message, statusCode = 400) {
    super(message, 'ClientError', statusCode);
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
  return (a.length ? [a[0], ...zip(b, a.slice(1))] : b);
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

/**
 * Extracts the desired properties from a request body and checks that they are the correct type
 * @param {Request} req The Express request
 * @param {{[key: string]: [type: string]}} properties An object mapping property names to their expected types
 * @returns {{[key: string]: any}} The provided properties mapped to their values from the request body
 * @throws {TypeError} If the request body is missing a property or the property is the incorrect type
 */
export function getBodyProps(req, properties) {
  const newProps = {};
  for (const [key, type] of Object.entries(properties)) {
    if (typeof req.body[key] !== type || req.body[key] === '')
      throw new ClientError(`Type "${typeof req.body[key]}" is invalid for property "${key}": "${type}"`);
    newProps[key] = req.body[key];
  }
  return newProps;
}