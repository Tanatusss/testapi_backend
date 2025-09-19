import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { router as measurementRouter } from './routes/measurement.js';
import { authToken } from './middlewares/auth.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.use('/v1', authToken, measurementRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});