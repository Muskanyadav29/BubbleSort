import dotenv from 'dotenv';
dotenv.config();

export const GAME_NAME = process.env.GAME_NAME || 'BUBBLE BLAST ADVENTURE';
export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'bubble_blast_super_secret_jwt_2026';
export const MONGODB_URI = process.env.MONGODB_URI || '';
