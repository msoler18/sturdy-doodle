import dotenv from 'dotenv';
import { logger } from './config/logger.config';

dotenv.config();

const PORT = process.env.PORT || 3000;

logger.info('Weather API - Setup Complete');
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`Port configured: ${PORT}`);