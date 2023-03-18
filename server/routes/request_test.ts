import { Router } from 'express';
import requestTestController from '../controllers/requestTestController';

const requestTestRouter = Router();

requestTestRouter.post('/body/json-primitive', requestTestController.bodyTests.postJsonPrimitive, (_, res) => res.sendStatus(200));
requestTestRouter.post('/body/primitive-info', requestTestController.bodyTests.postPrimitivePropInfo, (_, res) => res.sendStatus(200));
requestTestRouter.post('/body/object-info', requestTestController.bodyTests.postObjectPropInfo, (_, res) => res.sendStatus(200));
requestTestRouter.post('/body/array-info', requestTestController.bodyTests.postArrayPropInfo, (_, res) => res.sendStatus(200));

requestTestRouter.get('/query/json-primitive', requestTestController.queryTests.getWithJsonPrimitive, (_, res) => res.sendStatus(200));
requestTestRouter.get('/query/primitive-info', requestTestController.queryTests.getWithPrimitivePropInfo, (_, res) => res.sendStatus(200));
requestTestRouter.get('/query/object-info', requestTestController.queryTests.getWithObjectPropInfo, (_, res) => res.sendStatus(200));
requestTestRouter.get('/query/array-info', requestTestController.queryTests.getWithArrayPropInfo, (_, res) => res.sendStatus(200));

export default requestTestRouter;
