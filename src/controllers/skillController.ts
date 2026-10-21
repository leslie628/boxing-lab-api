import type { Request, Response } from 'express'
import { getSkills} from '../services/skillService.js'

export const getAllSkills = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const skills = await getSkills()
    res.status(200).json(skills)
  } catch (error) {
    console.error('Failed to fetch skills:', error)

    res.status(500).json({
      message: 'Failed to fetch skills.',
    })
  }
}