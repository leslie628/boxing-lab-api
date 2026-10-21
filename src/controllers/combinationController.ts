import type { Request, Response } from 'express'
import { createCombination, getCombinations , getCombinationById} from '../services/combinationService.js'
import type { CreateCombinationRequest } from '../types/combination.js'

export const postCombination = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, skillIds } = req.body as CreateCombinationRequest

  if (
    typeof name !== 'string' ||
    !name.trim() ||
    !Array.isArray(skillIds) ||
    !skillIds.every((id) => typeof id === 'string' && id.trim())
  ) {
    res.status(400).json({
      message: 'A combination name and valid skill IDs are required.',
    })
    return
  }

  try {
    const combination = await createCombination({
      name: name.trim(),
      skillIds,
    })

    res.status(201).json(combination)
  } catch (error) {
    console.error('Failed to create combination:', error)

    res.status(500).json({
      message: 'Failed to create combination.',
    })
  }
}

export const getAllCombinations = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const combinations = await getCombinations()
    res.status(200).json(combinations)
  } catch (error) {
    console.error('Failed to fetch combinations:', error)

    res.status(500).json({
      message: 'Failed to fetch combinations.',
    })
  }
}

export const getCombination = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.params.id

  if (typeof id !== 'string' || !/^\d+$/.test(id)) {
    res.status(400).json({ message: 'Invalid combination ID.' })
    return
  }

  try {
    const combination = await getCombinationById(id)

    if (!combination) {
      res.status(404).json({ message: 'Combination not found.' })
      return
    }

    res.status(200).json(combination)
  } catch (error) {
    console.error('Failed to fetch combination:', error)
    res.status(500).json({ message: 'Failed to fetch combination.' })
  }
}