// Vercel serverless function wrapper for Express app
// This file is used by Vercel to handle all API routes
//
// Vercel will:
// 1. Run 'npm install'
// 2. Run 'npm run build' (which generates Prisma client and compiles TypeScript)
// 3. Process this file to create the serverless function
//
// Import the Express app from the compiled dist folder
import app from '../dist/index.js';

// Export the Express app as the default export for Vercel
export default app;
