import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please check your .env file and make sure PostgreSQL is running.",
  );
}

try {
  export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  export const db = drizzle({ client: pool, schema });

  // Test the connection
  pool.query('SELECT 1').then(() => {
    console.log('Successfully connected to the database');
  }).catch((err) => {
    console.error('Failed to connect to the database:', err);
    throw err;
  });
} catch (error) {
  console.error('Error initializing database connection:', error);
  throw error;
}