import { Router } from 'express'
import { postTrainingSession, getAllTrainingSessions } from '../controllers/trainingController.js'

const router = Router()

router.post('/', postTrainingSession)
router.get('/', getAllTrainingSessions)
export default router
