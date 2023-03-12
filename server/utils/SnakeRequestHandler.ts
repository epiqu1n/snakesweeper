import { RequestHandler } from 'express';
import { ClientError, CustomError } from './utils';

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

export type RequestQueryTypes = qs.ParsedQs

export interface RequestData<
  Body extends RequestBodyTypes | undefined = RequestBodyTypes,
  Query extends RequestQueryTypes | undefined = RequestQueryTypes,
  Params extends readonly string[] = readonly string[]
> {
  body?: Body,
  query?: Query,
  params?: Params
}

export type SnakeRequestHandler<
  Body extends RequestData['body'] = RequestData['body'],
  Query extends RequestData['query'] = RequestData['query'],
  Params extends RequestData['params'] = RequestData['params']
> = RequestHandler<
  { [Key in (Params extends readonly (infer U)[] ? U : never)]: string }, // This is some magic I got from SO to turn an array of strings to keys in an object
  never,
  PropertyMap<Body>, 
  Query
>;

export type SnakeRequestController<
  Body extends RequestData['body'],
  Query extends RequestData['query'],
  Params extends RequestData['params']
> = (
  SnakeRequestHandler<Body, Query, Params> extends (
    req: infer Req,
    res: infer Res,
    next: unknown
  ) => void
  ? (
    req: Req,
    res: Res,
    next: <T>(err?: T extends Error ? T : MiddlewareError) => void
  ) => void
  : never
);

/** Creates an Express RequestHandler with request typing and validation */
export default function handleRequest<
  Body extends RequestData['body'],
  Query extends RequestData['query'],
  Params extends string[]
> (
  requestData: RequestData<Body, Query, readonly [...Params]> | undefined | null = {},
  controller: SnakeRequestController<Body, Query, Params>
): RequestHandler {
  const { body: bodyTypes, query: queryTypes } = requestData || {};

  return ((req, res, next) => {
    // Validate request body
    if (bodyTypes || queryTypes) {
      try {
        if (bodyTypes) validateJsonBody(req.body, bodyTypes);
        // if (queryTypes) validateUrlQuery(req.query, queryTypes); // TODO: Validate request query
      } catch (err) {
        return next(err);
      }
    }

    // Just to satisfy TypeScript since all props have been validated by this point
    type TypedRequest = typeof req & {
      body: PropertyMap<Body>,
      query: Query,
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
    typeof key === 'number' || key.match(/^\d+$/) ? `${base}[${key}]`      // Array index
    : key.match(/[.\s]|^\d/) ? `${base}['${key}']`  // Key that has period, whitespace, or starts with number
    : `${base}.${key}`
  );
  return newKeyPath;
}

/**
 * Validates a JSON request body against the provided structure.  
 * Assumes that all properties are required unless specified.
 * @throws {ClientError} if the body is malformed
 */
function validateJsonBody<EP extends RequestBodyTypes>(requestBody: Record<string, unknown>, expectedProps: EP | undefined, keyPath?: string): void {
  if (!expectedProps) return;

  for (const [key, expectedPropInfo] of Object.entries(expectedProps)) {
    const newKeyPath = makeKeyPath(keyPath, key);
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
      throw new ClientError(`Expected 'object' for property '${keyPath}', received '${Array.isArray(property) ? 'array' : typeof property}'`);
    }
    else validateJsonBody(property as Record<string, unknown>, propertyInfo.properties, keyPath);
  }
  else if (propertyInfo.type === 'array') {
    if (!Array.isArray(property)) {
      throw new ClientError(`Expected 'array' for property '${keyPath}', received '${typeof property}'`);
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
    const propertyType = (Array.isArray(property) ? 'array' : typeof property);
    throw new ClientError(`Type '${propertyType}' is invalid for property '${keyPath}': '${expectedType}'`);
  }
  else if (property === '') {
    throw new ClientError(`Required property '${keyPath}' cannot be empty`);
  }
}

// function validateAndCastQueryArgs<EP extends SnakeBodyTypes>(requestQuery: Request['query'], expectedProps: EP | undefined): void {
//   if (!expectedProps) return;

//   for (const [key, expectedPropInfo] of Object.entries(expectedProps)) {
//     // Check if property is in request body and if not, throw error if required
//     if (!(key in requestQuery)) {
//       if (typeof expectedPropInfo !== 'object' || expectedPropInfo.required !== false)
//         throw new ClientError(`Property '${key}' is required`);
//       else continue;
//     }
//     // If property info is an object, check if the type is 'object' and recurse if so (parsing the value as JSON if necessary), otherwise validate property type
//     else if (typeof expectedPropInfo === 'object') {
//       if (expectedPropInfo.type === 'object') { // Checking if expected type is an object
//         if (typeof requestQuery[key] !== 'object') {
//           // Checking if actual property value is an object
//           try {
//             requestQuery[key] = JSON.parse(requestQuery[key]);
//           } catch {
//             throw new ClientError(`Expected 'object' for property '${key}', received '${typeof requestBody[key]}'`);
//           }
//         }
//         else validateJsonBody(requestBody[key] as Record<string, unknown>, expectedPropInfo.properties);
//       }
//       else validatePropType(requestBody, key, expectedPropInfo.type);
//     }
//     // Property must be a primitive type so validate
//     else validatePropType(requestBody, key, expectedPropInfo);

// }

/* 
// Debug / testing:
const exampleBodyTypes = {
  sample: {
    type: 'object',
    properties: {
      level2s: {
        type: 'object',
        properties: {
          level3: 'number'
        }
      },
      level2b: {
        type: 'null',
        required: false
      },
      level2c: 'string'
    },
    required: false
  },
  bample: {
    type: 'boolean',
    required: false
  },
  cample: 'number'
} as const;

import { Router } from 'express';
const router = Router();
router.get(
  'test',
  SnakeRequestHandler({
    body: exampleBodyTypes,
    query: {
      bonko: 'string'
    },
    params: ['testerosa']
  },
  async (req, res, next) => {
    req.body;
    req.params;
    req.query;

    return next({
      msg: 'a',
      code: 2,
      err: new Error('bruh')
    });
  })
);
 */
