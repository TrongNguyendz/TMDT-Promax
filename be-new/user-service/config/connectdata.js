const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI_REAL);
        console.log('✅ MongoDB đã kết nối thành công!');
    } catch (error) {
        console.error('❌ Kết nối MongoDB thất bại:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;