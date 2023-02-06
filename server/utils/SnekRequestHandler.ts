import e, { Request, RequestHandler, Router } from 'express';
import { ClientError } from './utils';

export type JsonPrimitive = (
  'number'
  | 'string'
  | 'boolean'
  | 'null'
);

export interface JsonTypeMap extends Record<JsonPrimitive, unknown> {
  'number': number,
  'string': string,
  'boolean': boolean,
  'null': null
}

export type SnekProperty = (
  {
    type: JsonPrimitive,
    properties?: undefined,
    required?: boolean
  }
  | {
    type: 'object',
    properties: SnekBodyTypes,
    required?: boolean
  }
);

export interface SnekBodyTypes {
  [prop: string]: JsonPrimitive | SnekProperty
}

export interface SnekQueryTypes {
  [prop: string]: string | string[];
}

export interface RequestData<
  Body extends SnekBodyTypes | undefined = SnekBodyTypes,
  Query extends SnekQueryTypes | undefined = SnekQueryTypes,
  Params extends readonly string[] = readonly string[]
> {
  body?: Body,
  query?: Query,
  params?: Params
}

export type SnekRequestHandlerFunc<
  Body extends RequestData['body'],
  Query extends RequestData['query'],
  Params extends RequestData['params']
> = (
  RequestHandler<
    { [Key in (Params extends readonly (infer U)[] ? U : never)]: string },
    never,
    PropertyMap<Body>, 
    Query
  >
)

/** Creates an Express RequestHandler with request body/query/params typing and validation */
export default function SnekRequestHandler<
  Body extends RequestData['body'],
  Query extends RequestData['query'],
  Params extends string[]
>(
  requestData: RequestData<Body, Query, readonly [...Params]> | undefined | null = {},
  handler: SnekRequestHandlerFunc<Body, Query, Params>
): RequestHandler
{
  const { body: bodyTypes, query: queryTypes, params: paramsTypes  } = requestData || {};

  return ((req, res, next) => {
    // Validate request body
    if (req.body) {
      try {
        validateJsonBody(req.body, bodyTypes);
      } catch (err) {
        return next(err);
      }
    }

    // TODO: Validate request query

    type TypedRequest = typeof req & {
      body: PropertyMap<Body>,
      query: Query,
      params: { [Key in (Params extends readonly (infer U)[] ? U : never)]: string }
    };
    handler(req as TypedRequest, res, next);
  });
}

/** Maps a JavaScript object with properties and their expected types (represented in strings) to a TypeScript type  */
export type PropertyMap<ExpTypes extends SnekBodyTypes | undefined> = (
  ExpTypes extends undefined ? Record<string, never>
  : {
    [Key in keyof ExpTypes]: (
      ExpTypes[Key] extends JsonPrimitive ? JsonTypeMap[ExpTypes[Key]]
      : ExpTypes[Key] extends SnekProperty ?
        ExpTypes[Key]['type'] extends JsonPrimitive ?
          ExpTypes[Key]['required'] extends false ? JsonTypeMap[ExpTypes[Key]['type']] | undefined
          : JsonTypeMap[ExpTypes[Key]['type']]
        : ExpTypes[Key]['properties'] extends SnekBodyTypes ? PropertyMap<ExpTypes[Key]['properties']>
        : never
      : never
    )
  }
);

/**
 * Validates a JSON request body against the provided property:type structure.
 * Assumes that all properties are required unless specified.
 * @throws {ClientError} if the body is malformed
 */
function validateJsonBody<EP extends SnekBodyTypes>(requestBody: Record<string, unknown>, expectedProps: EP | undefined): void {
  if (!expectedProps) return;

  for (const [key, expectedPropInfo] of Object.entries(expectedProps)) {
    // Check if property is in request body and if not, throw error if required
    if (!(key in requestBody)) {
      if (typeof expectedPropInfo !== 'object' || expectedPropInfo.required !== false)
        throw new ClientError(`Property '${key}' is required`);
      else continue;
    }
    // If property info is an object, check if the type is 'object' and recurse if so, otherwise validate property type
    else if (typeof expectedPropInfo === 'object') {
      if (expectedPropInfo.type === 'object') { // Checking if expected type is an object
        if (typeof requestBody[key] !== 'object') // Checking if actual property value is an object
          throw new ClientError(`Expected 'object' for property '${key}', received '${typeof requestBody[key]}'`);
        else validateJsonBody(requestBody[key] as Record<string, unknown>, expectedPropInfo.properties);
      }
      else validatePropType(requestBody, key, expectedPropInfo.type);
    }
    // Property must be a primitive type so validate
    else validatePropType(requestBody, key, expectedPropInfo);
  }
}

/** Validates that a property in a request body is of the correct type (and not empty if a string) */
function validatePropType(reqBody: Record<string, unknown>, propName: string, expectedType: JsonPrimitive): void {
  if (typeof reqBody[propName] !== expectedType)
    throw new ClientError(`Type '${typeof reqBody[propName]}' is invalid for property '${propName}': '${expectedType}'`);
  else if (reqBody[propName] === '')
    throw new ClientError(`Required property '${propName}' cannot be empty`);
}

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

const router = Router();
router.get(
  'test',
  SnekRequestHandler({
    body: exampleBodyTypes,
    query: {
      bonko: 'string'
    },
    params: ['testerosa']
  },
  (req, res, next) => {
    req.body;
    req.params;
    req.query;
  })
);
 */
