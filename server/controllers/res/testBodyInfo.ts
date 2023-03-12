import { ArrayPropInfo, JsonPrimitive, ObjectPropInfo, PrimitivePropInfo, RequestBodyTypes } from '../../utils/SnakeRequestHandler';

export const jsonPrimitive = {
  primitiveProp: 'number'
} satisfies RequestBodyTypes & { primitiveProp: JsonPrimitive };

export const primitivePropInfo = {
  primitiveProp: {
    type: 'string',
    required: true
  }
} satisfies RequestBodyTypes & { primitiveProp: PrimitivePropInfo };

export const objectPropInfo = {
  objectProp: {
    type: 'object',
    properties: {
      objProp1a: 'number',
      objProp1b: {
        type: 'object',
        properties: {
          objProp1b_1: 'boolean'
        },
        required: true
      }
    },
    required: false
  }
} satisfies RequestBodyTypes & { objectProp: ObjectPropInfo };

export const arrayPropInfo = {
  arrayPropPrimitive: {
    type: 'array',
    elementType: jsonPrimitive.primitiveProp
  },
  arrayPropObject: {
    type: 'array',
    elementType: objectPropInfo.objectProp
  },
  arrayPropArray: {
    type: 'array',
    elementType: {
      type: 'array',
      elementType: jsonPrimitive.primitiveProp
    }
  }
} satisfies RequestBodyTypes & { arrayPropPrimitive: ArrayPropInfo, arrayPropObject: ArrayPropInfo };
