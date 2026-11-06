const express = require('express');
const bodyParser = require('body-parser');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Set CORS headers before routes so they are included in API responses.
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
	res.header('Vary', 'Origin');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	if (req.method === 'OPTIONS') {
		return res.sendStatus(204);
	}

	next();
});

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api/v1/orders', orderRoutes);

// Keep the error handler after routes and other middleware.
app.use((err, req, res, next) => {
	if (res.headersSent) {
		return next(err);
	}

	console.error(err);

	const errorStatus = err.status || err.statusCode;
	const status = Number.isInteger(errorStatus) && errorStatus >= 400 && errorStatus < 600
		? errorStatus
		: 500;

	res.status(status).json({
		error: status === 500 ? 'Internal server error' : err.message
	});
});

module.exports = app;
