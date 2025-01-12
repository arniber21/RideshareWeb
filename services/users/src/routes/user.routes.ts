import express from 'express';
import { UserController } from '../controllers/user.controller';

const router = express.Router();
const userController = new UserController();

router.post('/', (req, res) => userController.create(req, res));
router.get('/', (req, res) => userController.findAll(req, res));
router.get('/:id', (req, res) => userController.findOne(req, res));
router.put('/:id', (req, res) => userController.update(req, res));
router.delete('/:id', (req, res) => userController.delete(req, res));

export { router as userRouter }; 