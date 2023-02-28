import { Router } from 'express';
import testController from '../controllers/testController';

const testRouter = Router();

testRouter.post('/json-primitive', testController.postJsonPrimitive, (_, res) => res.sendStatus(200));
testRouter.post('/object-info', testController.postObjectPropInfo, (_, res) => res.sendStatus(200));

export default testRouter;
