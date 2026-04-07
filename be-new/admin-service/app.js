const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/connectdata');
connectDB();

const bannerRoutes = require('./routes/bannerRoutes');
// const searchHistoryRoutes = require('./routes/searchHistoryRoutes');
// const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cho phép truy cập trực tiếp vào thư mục upload
app.use('/uploads', express.static(path.join(__dirname, 'upload')));

app.use('/api/banners', bannerRoutes);
// app.use('/api/search-history', searchHistoryRoutes);
// app.use('/api/reports', reportRoutes);

module.exports = app;

