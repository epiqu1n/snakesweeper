import { RequestHandler } from 'express';
import handleRequest from '../utils/SnakeRequestHandler';
import { jsonPrimitive, objectPropInfo } from './res/testBodyInfo';

export interface TestController {
  postJsonPrimitive: RequestHandler,
  postObjectPropInfo: RequestHandler
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
  )
};

export default testController;
