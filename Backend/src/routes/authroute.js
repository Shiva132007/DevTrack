import express from 'express';
import { register,login,logout, getMe } from '../controllers/authcontroller.js';
import { protect } from '../middleware/authmiddleware.js';

const route = express.Router();

route.post("/register",register);
route.post("/login",login);
route.post("/logout",logout);
route.get('/getme',protect,getMe)
export default route