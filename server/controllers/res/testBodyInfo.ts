import { ArrayPropInfo, JsonPrimitive, ObjectPropInfo, PrimitivePropInfo, RequestBodyTypes } from '../../utils/SnakeRequestHandler';

export const jsonPrimitive: RequestBodyTypes & { primitiveProp: JsonPrimitive } = {
  primitiveProp: 'number'
};

export const objectPropInfo: RequestBodyTypes & { objectProp: ObjectPropInfo } = {
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
};

export const primitivePropInfo: RequestBodyTypes & { primitiveProp: PrimitivePropInfo } = {
  primitiveProp: {
    type: 'string',
    required: true
  }
};

export const arrayPropInfo: RequestBodyTypes & { arrayPropPrimitive: ArrayPropInfo, arrayPropObject: ArrayPropInfo } = {
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
};
