
import express from 'express';
import healthRoutes from './routes/healthRoutes.js';
import dotenv from 'dotenv';
import { testDatabaseConnection } from './services/databaseService.js';
import combinationRoute from './routes/combinationRoute.js';
import skillRoute from './routes/skillRoute.js';
import cors from 'cors';
import trainingRoute from './routes/trainingRoute.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;
app.use(
    cors({
        origin: 'http://localhost:5173',
    })
)
app.use(express.json());
app.use('/api/health', healthRoutes);
app.use('/api/combinations', combinationRoute);
app.use('/api/skills', skillRoute);
app.use('/api/training', trainingRoute);

app.listen(PORT, async () => {
  console.log(`Boxing Lab API running on port ${PORT}`);
  await testDatabaseConnection();
});
