const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/authRoutes');

const app = express();

app.use(bodyParser.json());

app.use('/api/auth', userRoutes);

module.exports = app;
