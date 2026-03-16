const express = require('express');
const cors = require('cors');

require('dotenv').config();
require('./config/database');


const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/wishlists', require('./routes/wishlistRoutes'));

module.exports = app; // 🔥 BẮT BUỘC

