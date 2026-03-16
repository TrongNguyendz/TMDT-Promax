const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();
require('./config/connectdata');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded avatars statically
app.use('/uploads', express.static(path.join(__dirname, 'upload')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

module.exports = app;


