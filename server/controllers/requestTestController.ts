import handleRequest, { SnakeRequestHandler } from '../utils/SnakeRequestHandler';
import { arrayPropInfo, jsonPrimitive, objectPropInfo, primitivePropInfo } from './res/testBodyInfo';

export interface RequestTestController {
  bodyTests: {
    postJsonPrimitive: SnakeRequestHandler,
    postPrimitivePropInfo: SnakeRequestHandler,
    postObjectPropInfo: SnakeRequestHandler,
    postArrayPropInfo: SnakeRequestHandler
  },
  queryTests: {
    getWithJsonPrimitive: SnakeRequestHandler,
    getWithPrimitivePropInfo: SnakeRequestHandler,
    getWithObjectPropInfo: SnakeRequestHandler,
    getWithArrayPropInfo: SnakeRequestHandler
  }
}

const requestTestController: RequestTestController = {
  /// Body tests
  bodyTests: {
    postJsonPrimitive: handleRequest(
      { body: jsonPrimitive },
      (_, __, next) => next()
    ),
    postPrimitivePropInfo: handleRequest(
      { body: primitivePropInfo },
      (_, __, next) => next()
    ),
    postObjectPropInfo: handleRequest(
      { body: objectPropInfo },
      (_, __, next) => next()
    ),
    postArrayPropInfo: handleRequest(
      { body: arrayPropInfo },
      (_, __, next) => next()
    )
  },

  /// Query tests
  queryTests: {
    getWithJsonPrimitive: handleRequest(
      { query: jsonPrimitive },
      (_, __, next) => next()
    ),
    getWithPrimitivePropInfo: handleRequest(
      { query: primitivePropInfo },
      (_, __, next) => next()
    ),
    getWithObjectPropInfo: handleRequest(
      { query: objectPropInfo },
      (_, __, next) => next()
    ),
    getWithArrayPropInfo: handleRequest(
      { query: arrayPropInfo },
      (_, __, next) => next()
    )
  }
};

export default requestTestController;
