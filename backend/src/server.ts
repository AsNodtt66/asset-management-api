import 'dotenv/config';
import { buildApp } from './app';

async function start() {
  try {
    // Build Fastify app
    const app = await buildApp();

    // ✅ Validasi environment variables
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
        `Please check your .env file`
      );
    }
    // Start server
    const PORT = parseInt(process.env.PORT || '3000', 10);
    const HOST = process.env.HOST || '0.0.0.0';
    console.log(app.printRoutes());
    
    await app.listen({ port: PORT, host: HOST });

    console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  🚀 Asset Management API is running!                   ║
║                                                        ║
║  📍 Server: http://${HOST}:${PORT}                      ║
║  📚 Docs:   http://${HOST}:${PORT}/docs                ║
║  ❤️  Health: http://${HOST}:${PORT}/health             ║
║                                                        ║
║  Environment: ${process.env.NODE_ENV || 'development'} ║
║  Log Level:   ${process.env.LOG_LEVEL || 'info'}       ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `);

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Start the application
start();
