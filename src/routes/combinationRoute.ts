import { Router } from 'express'
import { postCombination, getAllCombinations } from '../controllers/combinationController.js'
import { getCombinationById } from '../services/combinationService.js'

const router = Router()

router.post('/', postCombination)
router.get('/', getAllCombinations)
router.get('/:id', getCombinationById)

export default router
