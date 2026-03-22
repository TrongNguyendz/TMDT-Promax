const app = require('./app');
const connectDB = require('./configs/database');

const PORT = process.env.PORT || 3008;

const startServer = async () => {
    try {
        // Kết nối Database
        console.log("⏳ Đang thiết lập kết nối Database...");
        await connectDB();
        // Khởi động Server Express
        const server = app.listen(PORT, () => {
            console.log(`-----------------------------------------------`);
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`-----------------------------------------------`);
        });

        // Xử lý đóng server an toàn khi có lỗi đột ngột
        process.on("unhandledRejection", (err) => {
            console.log(`❌ Unhandled Rejection: ${err.message}`);
            server.close(() => process.exit(1));
        });

    } catch (error) {
        console.error("❌ Error starting server:", error.message);
        console.error(error.message);
        process.exit(1);
    }
};

startServer();