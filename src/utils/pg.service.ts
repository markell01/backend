import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import session from 'express-session';

export const PgStore = connectPgSimple(session);

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});