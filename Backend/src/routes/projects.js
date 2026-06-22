import express from 'express';
import { getProjects,getProjectsById,createProject,UpdateProject,Addmember,removeMember,deleteProject } from '../controllers/Projectcontrollers.js';
import {protect,authorize} from '../middleware/authmiddleware.js';

const route=express.Router();

route.use(protect);

route.get('/',getProjects);

route.get('/:id',getProjectsById);

route.post('/',authorize('admin'),createProject);

route.patch('/:id',UpdateProject);

route.patch('/:id/add-member',Addmember);

route.patch('/:id/remove-member',removeMember);

route.delete('/:id',authorize('admin'),deleteProject);

export default route;
