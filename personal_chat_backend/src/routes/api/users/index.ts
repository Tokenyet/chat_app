import express from 'express';
import auth from '../../_auth';
import { postLogin, postSignup, getMe } from '../../_controllers/users';

const router = express.Router();

router.get('/users/me', auth.required, getMe);

router.post('/users/login', postLogin);

router.post('/users/signup', postSignup);

export default router;
