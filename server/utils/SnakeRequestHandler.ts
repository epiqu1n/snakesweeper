import { Request, RequestHandler, Response } from 'express';
import { ClientError, CustomError, getType } from './utils';

export interface MiddlewareError {
  /** The message that will be sent to the client */
  msg: string,
  /** The error for logging to the server console */
  err?: Error | CustomError,
  /** The HTTP status code that should be sent */
  code?: number
}

export type JsonPrimitive = (
  'number'
  | 'string'
  | 'boolean'
  | 'null'
);

export type PrimitivePropInfo = {
  type: JsonPrimitive,
  required?: boolean
}
export type ObjectPropInfo = {
  type: 'object',
  properties: RequestBodyTypes,
  required?: boolean
}
export type ArrayPropInfo = {
  type: 'array',
  elementType: JsonPrimitive | Omit<PrimitivePropInfo, 'required'> | Omit<ObjectPropInfo, 'required'> | Omit<ArrayPropInfo, 'required'>,
  required?: boolean
}

export type PropertyInfo = (
  PrimitivePropInfo
  | ObjectPropInfo
  | ArrayPropInfo
);

export interface RequestBodyTypes {
  [prop: string]: JsonPrimitive | PropertyInfo
}

export type RequestQueryTypes = RequestBodyTypes;

export interface RequestInputData<
  Body extends RequestBodyTypes | undefined = RequestBodyTypes,
  Query extends RequestQueryTypes | undefined = RequestQueryTypes,
  Params extends readonly string[] = readonly string[]
> {
  body?: Body,
  query?: Query,
  params?: Params
}

export type SnakeRequestHandler<
  Body extends RequestInputData['body'] = RequestInputData['body'],
  Query extends RequestInputData['query'] = RequestInputData['query'],
  Params extends RequestInputData['params'] = RequestInputData['params']
> = RequestHandler<
  { [Key in (Params extends readonly (infer U)[] ? U : never)]: string }, // This is some magic I got from SO to turn an array of strings to keys in an object
  never,
  PropertyMap<Body>, 
  PropertyMap<Query>
>;

export type SnakeRequest<
  Body extends RequestInputData['body'] = RequestInputData['body'],
  Query extends RequestInputData['query'] = RequestInputData['query'],
  Params extends RequestInputData['params'] = RequestInputData['params']
> = Request<
  { [Key in (Params extends readonly (infer U)[] ? U : never)]: string }, // This is some magic I got from SO to turn an array of strings to keys in an object
  never,
  PropertyMap<Body>, 
  PropertyMap<Query>
>;

export type SnakeRequestController<
  Body extends RequestInputData['body'],
  Query extends RequestInputData['query'],
  Params extends RequestInputData['params']
> = (
  req: SnakeRequest<Body, Query, Params>,
  res: Response,
  next: <T>(err?: T extends Error ? T : MiddlewareError) => void
) => void

/** Creates an Express RequestHandler with request typing and validation */
export default function handleRequest<
  Body extends RequestInputData['body'],
  Query extends RequestInputData['query'],
  Params extends string[]
> (
  requestData: RequestInputData<Body, Query, readonly [...Params]> | undefined | null = {},
  controller: SnakeRequestController<Body, Query, Params>
): RequestHandler {
  const { body: bodyTypes, query: queryTypes } = requestData || {};

  return ((req, res, next) => {
    // Validate request body
    if (bodyTypes || queryTypes) {
      try {
        if (bodyTypes) validateJsonBody(req.body, bodyTypes);
        if (queryTypes) req.query = validateAndCastQueryArgs(req.query, queryTypes) || {};
      } catch (err) {
        return next(err);
      }
    }

    // Just to satisfy TypeScript since all props have been validated by this point
    type TypedRequest = typeof req & {
      body: PropertyMap<Body>,
      query: PropertyMap<Query>,
      params: { [Key in (Params extends readonly (infer U)[] ? U : never)]: string }
    };
    controller(req as TypedRequest, res, next);
  });
}

export interface JsonTypeMap extends Record<JsonPrimitive, unknown> {
  'number': number,
  'string': string,
  'boolean': boolean,
  'null': null
}

/** Maps a JavaScript object with properties and their expected types (represented in strings) to a TypeScript type  */
export type PropertyMap<ExpTypes extends RequestBodyTypes | undefined> = (
  ExpTypes extends undefined ? Record<string, never>
  : {
    [Key in keyof ExpTypes]: (
      ExpTypes[Key] extends JsonPrimitive
      ? JsonTypeMap[ExpTypes[Key]]
      : ExpTypes[Key] extends PropertyInfo
        ? ExpTypes[Key]['required'] extends false
          ? SnakePropertyMap<ExpTypes[Key]> | undefined
        : SnakePropertyMap<ExpTypes[Key]>
      : never
    )
  }
);

/** Helper type for mapping property info */
type SnakePropertyMap<ExpType extends PropertyInfo> = (
  ExpType extends PrimitivePropInfo
  ? JsonTypeMap[ExpType['type']] | undefined
  : ExpType extends ArrayPropInfo
    ? ExpType['elementType'] extends JsonPrimitive
      ? JsonTypeMap[ExpType['elementType']][]
    : ExpType['elementType'] extends RequestBodyTypes
      ? PropertyMap<ExpType['elementType']>
    : never
  : ExpType extends ObjectPropInfo
    ? PropertyMap<ExpType['properties']>
  : never
);

/** Creates a printable representation of the path to a key in an object, where the base is the current path so far. */
function makeKeyPath(base: string | undefined, key: string | number): string {
  if (!base) return `${key}`;

  const newKeyPath = (
    typeof key === 'number' || key.match(/^\d+$/) ? `${base}[${key}]` // Array index
    : key.match(/[.\s]|^\d/) ? `${base}['${key}']` // Key that has period, whitespace, or starts with number
    : `${base}.${key}`
  );
  return newKeyPath;
}

/**
 * Validates a JSON request body against the provided structure.  
 * Assumes that all properties are required unless specified.
 * @throws {ClientError} if the body is malformed
 */
function validateJsonBody<EP extends RequestBodyTypes>(requestBody: Request['body'], expectedProps: EP | undefined, keyPath?: string): void {
  if (!expectedProps) return;

  for (const [key, expectedPropInfo] of Object.entries(expectedProps)) {
    const newKeyPath = makeKeyPath(keyPath, key);
    if (!requestBody) throw new ClientError(`Expected 'object' for property '${keyPath}', received '${getType(requestBody)}'`);

    // Check if property is in request body. If not, throw error if required, otherwise skip
    if (!(key in requestBody)) {
      if (typeof expectedPropInfo !== 'object' || expectedPropInfo.required !== false) {
        throw new ClientError(`Property '${newKeyPath}' is required`);
      }
      else continue;
    }

    if (typeof expectedPropInfo === 'object') validatePropertyInfo(requestBody[key], expectedPropInfo, newKeyPath);
    else validatePrimitiveProperty(requestBody[key], expectedPropInfo, newKeyPath);
  }
}

/** Validates a property based on its provided information */
function validatePropertyInfo<PI extends PropertyInfo>(property: unknown, propertyInfo: PI, keyPath = 'object'): void {
  if (propertyInfo.type === 'object') {
    if (typeof property !== 'object' || Array.isArray(property)) {
      throw new ClientError(`Expected 'object' for property '${keyPath}', received '${getType(property)}'`);
    }
    else validateJsonBody(property as Record<string, unknown>, propertyInfo.properties, keyPath);
  }
  else if (propertyInfo.type === 'array') {
    if (!Array.isArray(property)) {
      throw new ClientError(`Expected 'array' for property '${keyPath}', received '${getType(property)}'`);
    }
    else {
      for (let i = 0; i < property.length; i++) {
        const element = property[i];
        const newKeyPath = makeKeyPath(keyPath, i);
        if (typeof propertyInfo.elementType === 'object') validatePropertyInfo(element as Record<string, unknown>, propertyInfo.elementType, newKeyPath);
        else validatePrimitiveProperty(element, propertyInfo.elementType, newKeyPath);
      }
    }
  }
  else validatePrimitiveProperty(property, propertyInfo.type, keyPath);
}

/** Validates that a primitive property is of the correct type (and not empty if a string) */
function validatePrimitiveProperty(property: unknown, expectedType: JsonPrimitive, keyPath: string): void {
  if (typeof property !== expectedType) {
    throw new ClientError(`Type '${getType(property)}' is invalid for property '${keyPath}': '${expectedType}'`);
  }
  else if (property === '') {
    throw new ClientError(`Required property '${keyPath}' cannot be empty`);
  }
}

function validateAndCastQueryArgs<EP extends RequestBodyTypes>(requestQuery: Request['query'], expectedProps: EP | undefined): PropertyMap<EP> | null {
  if (!expectedProps) return null;

  const castedQueryArgs: Record<string, unknown> = {};
  for (const [key, expectedPropInfo] of Object.entries(expectedProps)) {
    const keyPath = makeKeyPath('', key);
    const value = requestQuery[key];

    // Check if property is in request body. If not, throw error if required, otherwise skip
    if (!(key in requestQuery)) {
      if (typeof expectedPropInfo !== 'object' || expectedPropInfo.required !== false) {
        throw new ClientError(`Query property '${keyPath}' is required`);
      }
      else continue;
    }

    if (typeof expectedPropInfo === 'string' || expectedPropInfo.type.match(/number|string|boolean|null/)) {
      const expectedType = (typeof expectedPropInfo === 'string' ? expectedPropInfo : expectedPropInfo.type) as JsonPrimitive;
      if (typeof value !== 'string') throw new ClientError(`Failed to cast non-string query value '${keyPath}'`);
      castedQueryArgs[key] = castJsonPrimitive(value, expectedType, keyPath);
    }
    else {
      if (typeof value !== 'string') throw new ClientError(`Query property '${keyPath}' must be a JSON string`);
      try {
        castedQueryArgs[key] = JSON.parse(value);
      } catch (err) {
        throw new ClientError(`Failed to parse '${keyPath}' as JSON`);
      }
      validatePropertyInfo(castedQueryArgs[key], expectedPropInfo, keyPath);
    }
  }

  return castedQueryArgs as PropertyMap<EP>;
}

/**
 * Attempts to cast a given value in the form of a string to its expected type.
 * If the cast is not successful, throws a `ClientError`
 * @throws {ClientError}
 */
function castJsonPrimitive(value: string, expectedType: JsonPrimitive, keyPath: string) {
  switch (expectedType) {
    case 'boolean':
      if (value.match(/true|false/i)) return (value.toLowerCase() === 'true');
      else break;
    case 'number':
      const casted = parseFloat(value);
      if (!Number.isNaN(casted)) return casted;
      else break;
    case 'string':
      if (typeof value === 'string') return value;
      else break;
    case 'null':
      if (value.toLowerCase() === 'null') return null;
      else break;
  }

  // If it reaches here, casting failed
  throw new ClientError(`Failed to cast query property '${keyPath}' to type '${expectedType}'`);
}
