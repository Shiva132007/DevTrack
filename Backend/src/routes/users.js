import express from 'express';
import { getUsers,getUserById,createUser,updateUser,deleteUser } from '../controllers/usercontroller.js';
import { protect,authorize } from '../middleware/authmiddleware.js';

const route = express.Router();

route.use(protect);

//ADMIN SEES ALL USERS|MANAGER 
route.get('/',authorize('admin','manager'),getUsers);

route.get('/:id',authorize('admin','manager'),getUserById);

route.post('/',protect,authorize('admin','manager'),createUser);

route.patch('/:id',authorize('admin','manager'),updateUser);

route.delete('/:id',authorize('admin'),deleteUser);

export default route;