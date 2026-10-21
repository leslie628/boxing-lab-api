import { Router } from 'express'
import { getAllSkills } from '../controllers/skillController.js'

const router = Router()

router.get('/', getAllSkills)

export default router
