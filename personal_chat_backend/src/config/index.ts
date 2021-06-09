import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env')) {
  // logger.debug('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' });
} else {
  // logger.debug('Using .env.example file to supply config environment variables');
  dotenv.config({ path: '.env.example' }); // you can delete this after you create your own .env file!
}

export const PORT = process.env['PORT'];
export const JWT_SECRET = process.env['JWT_SECRET'];
export const ENVIROMENT = process.env['NODE_ENV'];
export const MONGODB_URI = process.env['MONGODB_URI'];
