const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: { 
        type: String, 
        required: true 
    },
    notification_type: { 
        type: String, 
        required: true 
    },
    email_user: { 
        type: String, 
        required: true 
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Chuyển _id thành id khi trả về JSON
notificationSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

// Helper check ID
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- 1. Lấy danh sách (Có lọc & Phân trang) ---
exports.listNotifications = async (filters = {}) => {
    const query = {};
    
    // Ánh xạ các điều kiện lọc
    if (filters.user_id) query.user_id = filters.user_id;
    if (filters.notification_type) query.notification_type = filters.notification_type;

    const limit = Number(filters.limit) || 20;
    const page = Number(filters.page) || 1;
    const skip = (page - 1) * limit;

    // Chạy song song: Lấy dữ liệu + Đếm tổng
    const [notifications, total] = await Promise.all([
        Notification.find(query)
            .sort({ created_at: -1 }) // Mới nhất lên đầu
            .skip(skip)
            .limit(limit),
        Notification.countDocuments(query)
    ]);

    return {
        data: notifications,
        pagination: {
            total: total,
            page,
            limit,
            pages: Math.ceil(total / limit) || 1
        }
    };
};

// --- 2. Tìm theo ID ---
exports.findById = async (id) => {
    if (!isValidId(id)) return null;
    return await Notification.findById(id);
};

// --- 3. Tạo mới ---
exports.createNotification = async (payload) => {
    // payload gồm: user_id, notification_type, email_user
    const newNotification = await Notification.create(payload);
    return newNotification;
};

// --- 4. Xóa ---
exports.deleteNotification = async (id) => {
    if (!isValidId(id)) return false;
    const result = await Notification.findByIdAndDelete(id);
    return !!result;
};