const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();
require('./config/database');

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded assets statically for local inspection/testing
app.use('/uploads', express.static(path.join(__dirname, 'upload')));

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

module.exports = app;


