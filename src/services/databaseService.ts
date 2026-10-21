import { pool } from '../config/database.js'

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');

    console.log('Database connected:', result.rows[0].current_time);

    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}