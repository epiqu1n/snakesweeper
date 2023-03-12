import handleRequest, { SnakeRequestHandler } from '../utils/SnakeRequestHandler';
import { arrayPropInfo, jsonPrimitive, objectPropInfo } from './res/testBodyInfo';

export interface TestController {
  postJsonPrimitive: SnakeRequestHandler,
  postObjectPropInfo: SnakeRequestHandler,
  postArrayPropInfo: SnakeRequestHandler
}

const testController: TestController = {
  postJsonPrimitive: handleRequest(
    {
      body: jsonPrimitive
    },
    (_, __, next) => next()
  ),

  postObjectPropInfo: handleRequest(
    {
      body: objectPropInfo
    },
    (_, __, next) => next()
  ),

  postArrayPropInfo: handleRequest(
    {
      body: arrayPropInfo
    },
    (_, __, next) => next()
  )
};

export default testController;
