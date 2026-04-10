require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./sockets/socketManager');
const { startAllJobs } = require('./jobs/cronJobs');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start cron jobs
startAllJobs();

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    console.log('🔒 HTTP server closed');
    await prisma.$disconnect();
    console.log('🗄️  Database disconnected');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  process.exit(1);
});

// Connect to DB then start server
prisma
  .$connect()
  .then(() => {
    console.log('✅ Database connected');
    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 Socket.IO ready`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
