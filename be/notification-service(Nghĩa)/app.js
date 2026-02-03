const express = require('express');
const cors = require('cors');

require('dotenv').config();
require('./config/database');

const notificationRoutes = require('./routes/notificationRoutes');

// const preferenceRoutes = require('./routes/preferenceRoutes');


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/notifications', notificationRoutes);

// app.use('/api/notification-preferences', preferenceRoutes);


module.exports = app;


