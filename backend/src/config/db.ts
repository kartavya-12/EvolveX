import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool(
  process.env.DATABASE_URL 
    ? { 
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } 
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'evolvex',
        port: parseInt(process.env.DB_PORT || '5432'),
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
);

export default pool;
