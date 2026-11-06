const app = require('./app');

// BUG #5 fixed: Use the environment port, with a default fallback.
const portValue = process.env.PORT;
const PORT = portValue === undefined || portValue.trim() === ''
    ? 3000
    : Number(portValue);

if (!Number.isInteger(PORT) || PORT < 0 || PORT > 65535) {
    throw new Error('PORT must be an integer between 0 and 65535');
}

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// BUG #6 fixed: Gracefully close the server when the process receives a signal.
let shuttingDown = false;

function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`${signal} received; shutting down`);

    const shutdownTimeout = setTimeout(() => {
        console.error('Graceful shutdown timed out; forcing exit');
        process.exit(1);
    }, 10_000);

    server.close(error => {
        clearTimeout(shutdownTimeout);

        if (error) {
            console.error('Error during server shutdown:', error);
            process.exitCode = 1;
            return;
        }

        console.log('Server shut down gracefully');
    });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
