// var router = require('express').Router();
import express from 'express';
import auth from '../../_auth';
import { getMessage, postNewUser } from '../../_controllers/messages';

const router = express.Router();

// /messages/history/:chatterId?limit=xx&before_timestamp=xx
router.get('/messages/history/:chatterId', auth.required, getMessage);

router.post('/messages/addUser/:name', auth.required, postNewUser);

export default router;
