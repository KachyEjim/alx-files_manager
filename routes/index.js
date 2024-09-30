import { Router } from 'express';
import AppController from '../controllers/AppController';
import Usercontroller from '../controllers/Usercontroller';

const router = Router();

// Define the endpoints and map them to the controller methods
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnec', AuthController.getDisconnect);
router.get('/users/me', UserController.getMe);

router.post('/files', FilesController.postUpload);

export default router;
