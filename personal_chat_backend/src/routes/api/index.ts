import express from 'express';

import userApi from './users';
import messageApi from './messages';

const router = express.Router();

router.use('/', userApi);
router.use('/', messageApi);

export default router;
