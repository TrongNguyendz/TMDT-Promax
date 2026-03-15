const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();
require('./config/connectdata');

const staffRoutes = require('./routes/staffRoutes');
const shiftRoutes = require('./routes/shiftRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded avatars statically
app.use('/uploads', express.static(path.join(__dirname, 'upload')));

app.use('/api/staff', staffRoutes);
app.use('/api/shifts', shiftRoutes);

module.exports = app;