const mongoose = require('mongoose');
const dotenv = require('dotenv');

// globel uncaught exception handler
// This is for the case when we have an error that is not handled
// and it gets thrown. This is a global handler for uncaught exceptions.
// It will log the error and shut down the server.
// This is important because if we don't handle uncaught exceptions,
// the server will crash and we won't be able to handle any more requests.
// So we need to handle it and shut down the server gracefully.

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handle unhandled promise rejections
// This is for the case when we have a promise that is not handled
// and it gets rejected. This is a global handler for unhandled promise rejections.
// It will log the error and shut down the server.
// This is important because if we don't handle unhandled promise rejections,
// the server will crash and we won't be able to handle any more requests.
// So we need to handle it and shut down the server gracefully.
// This is a good practice to do in production.

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// This is for the case when we have a SIGTERM signal emitted.
// This is a signal that is sent to the process when we want to terminate it.
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
