import { pool } from "../config/database.js";
import type {
  Skill
} from "../types/skill.js";

export const getSkills = async (): Promise<Skill[]> => {
  const result = await pool.query(`
    SELECT s.id, s.name, s.category, s.description, s.created_at,us.status
    FROM skills s left join user_skills us on s.id = us.skill_id
    ORDER BY created_at DESC
  `);

  return result.rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    status: row.status,
    category: row.category,
    description: row.description,
    createdAt: row.created_at,
  }));
};

export const updateSkillStatus = async (
  id: string,
  status: 'natural' | 'needs-work' | null,
): Promise<Skill> => {
  const result = await pool.query(
    `
      UPDATE skills
      SET status = $1
      WHERE id = $2
      RETURNING *
    `,
    [status, id]
  );

  const updatedSkill = result.rows[0] ?? null;
  return updatedSkill;
};
