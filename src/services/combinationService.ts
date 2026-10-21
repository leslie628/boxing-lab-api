import { pool } from "../config/database.js";
import type {
  Combination,
  CreateCombinationRequest,
} from "../types/combination.js";

export const createCombination = async (
  data: CreateCombinationRequest,
): Promise<Combination> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const combinationResult = await client.query(
      `INSERT INTO combinations (name)
       VALUES ($1)
       RETURNING id, name, created_at, updated_at`,
      [data.name.trim()],
    );

    const combination = combinationResult.rows[0];

    if (data.skillIds.length > 0) {
      const values: unknown[] = [];
      const placeholders = data.skillIds.map((skillId, index) => {
        const offset = index * 3;

        values.push(combination.id, skillId, index);

        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
      });

      await client.query(
        `INSERT INTO combination_skills
           (combination_id, skill_id, position)
         VALUES ${placeholders.join(", ")}`,
        values,
      );
    }

    await client.query("COMMIT");

    return {
      id: String(combination.id),
      name: combination.name,
      skillIds: data.skillIds,
      createdAt: combination.created_at,
      updatedAt: combination.updated_at,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getCombinations = async (): Promise<Combination[]> => {
  const result = await pool.query(`
    SELECT
      c.id,
      c.name,
      c.created_at,
      c.updated_at,
      COALESCE(
        json_agg(cs.skill_id ORDER BY cs.position)
          FILTER (WHERE cs.skill_id IS NOT NULL),
        '[]'::json
      ) AS skill_ids
    FROM combinations c
    LEFT JOIN combination_skills cs
      ON cs.combination_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);

  return result.rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    skillIds: row.skill_ids,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

export const getCombinationById = async (
  id: string,
): Promise<Combination | null> => {
  const result = await pool.query(
    `
      SELECT
        c.id,
        c.name,
        c.created_at,
        c.updated_at,
        COALESCE(
          json_agg(cs.skill_id ORDER BY cs.position)
            FILTER (WHERE cs.skill_id IS NOT NULL),
          '[]'::json
        ) AS skill_ids
      FROM combinations c
      LEFT JOIN combination_skills cs
        ON cs.combination_id = c.id
      WHERE c.id = $1
      GROUP BY c.id
    `,
    [id],
  )

  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]

  return {
    id: String(row.id),
    name: row.name,
    skillIds: row.skill_ids,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}