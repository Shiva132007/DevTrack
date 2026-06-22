import express from 'express';
import{
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTaskStats,
    
} from '../controllers/taskcontroller.js'

import {protect,authorize} from '../middleware/authmiddleware.js';

const route = express.Router();

route.use(protect);

route.get('/',getTasks);

route.get('/stats',authorize('admin','manager'),getTaskStats);

route.get('/:id',getTaskById);

route.post("/",authorize('admin','manager'),createTask);

route.patch('/:id/status',updateTaskStatus);

route.patch('/:id',authorize('admin','manager'),updateTask);

route.delete('/:id',authorize('admin'),deleteTask);

export default route;