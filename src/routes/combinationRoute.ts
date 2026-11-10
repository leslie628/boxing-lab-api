import { Router } from 'express'
import { postCombination, getAllCombinations, updateCombinationStatus, getAICombinationSuggestions, deleteCombinationController } from '../controllers/combinationController.js'
import { deleteCombination, getCombinationById } from '../services/combinationService.js'

const router = Router()

router.post('/', postCombination)
router.get('/', getAllCombinations)
router.get('/:id', getCombinationById)
router.delete('/:id',deleteCombinationController)
router.patch('/:id/status', updateCombinationStatus)
router.post('/ai', getAICombinationSuggestions)

export default router
