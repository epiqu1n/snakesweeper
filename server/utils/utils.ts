import colors from 'colors';
import { Request } from 'express';

export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, className = 'CustomError', statusCode = 500) {
    super(message);
    this.name = className;
    this.stack = this.cleanStacktrace(this.stack || '');
    this.statusCode = statusCode;
  }
  
  /**
   * Scrubs references to node_modules from stacktrace to make it more readable
   */
  private cleanStacktrace(stack: string) {
    const newStack = stack.split(/\n/g).filter((line, i) => i == 0 || !line.match(/node_modules/));
    return newStack.join('\n');
  }
}

export class ServerError extends CustomError {
  /**
   * Custom error class for server-side errors
   * @param statusCode Default 500
   */
  constructor(message: string, statusCode = 500) {
    super(message, 'ServerError', statusCode);
  }
}

export class ClientError extends CustomError {
  /**
   * Custom error class for client-side errors
   * @param statusCode Default 400
   */
  constructor(message: string, statusCode = 400) {
    super(message, 'ClientError', statusCode);
  }
}

/**
 * "Zips" together 2 arrays in an alternating fashion.  
 * e.g. `zip([1,3], [2,4]) == [1,2,3,4]`
 */
export function zip<A, B>(a: A[], b: B[]): (A | B)[] {
  return (a.length ? [a[0], ...zip(b, a.slice(1))] : b);
}

/**
 * Logs an error to the console in red
 * @param message
 * @param optionalParams 
 */
export function error(message: unknown = '', ...optionalParams: unknown[]) {
  console.error(colors.red(message as string), ...optionalParams.map(p => colors.red(typeof p === 'string' ? p : JSON.stringify(p))));
}

/**
 * Logs an error to the console in red
 * @param message
 * @param optionalParams 
 */
export function warn(message: unknown = '', ...optionalParams: unknown[]) {
  console.warn(colors.yellow(message as string), ...optionalParams.map(p => colors.yellow(typeof p === 'string' ? p : JSON.stringify(p))));
}

interface TypeMap {
  string: string,
  number: number,
  boolean: boolean,
  symbol: symbol,
  undefined: undefined,
  object: object,
  null: null
}

export type PropertyMap<PT extends Record<string, keyof TypeMap>> = {
  [Key in keyof PT]: TypeMap[PT[Key]]
}

/**
 * Extracts the desired properties from a request body and checks that they are the correct type
 * @throws {ClientError} If the request body is missing a property or the property is the incorrect type
 */
export function extractBody<EP extends Record<string, keyof TypeMap>>(req: Request, expectedProps: EP) {
  const newProps = {} as PropertyMap<EP>;

  for (const [key, expType] of Object.entries(expectedProps)) {
    if (typeof req.body[key] !== expType)
      throw new ClientError(`Type "${typeof req.body[key]}" is invalid for property "${key}": "${expType}"`);
    else if (req.body[key] === '')
      throw new ClientError(`Required property "${key}" cannot be empty`);

    newProps[key as keyof EP] = req.body[key];
  }
  
  return newProps;
}

/** Checks if the provided value can be converted to a non-NaN number */
export function isNum(value: unknown) {
  return !isNaN(parseInt(value as string));
}

/** Gets the type of a variable, with support for "array" and "object" as well */
export function getType(value: unknown) {
  return ( value === null ? 'null' : value instanceof Array ? 'array' : typeof value  );
}
