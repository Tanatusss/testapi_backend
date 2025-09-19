import express from 'express';
import { getMeasurement, getListMeasurement, getCompanyMeasurement } from '../controllers/measurement.controller.js';
import { authToken } from '../middlewares/auth.js';

export const router = express.Router();

router.post('/getMeasurement', authToken, getMeasurement);
router.post('/getListMeasurement', authToken, getListMeasurement);
router.post('/getCompanyMeasurement', authToken, getCompanyMeasurement);