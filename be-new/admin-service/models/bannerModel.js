const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    image_url: { type: String, required: true },
    link: { type: String },
    link_type: { 
        type: String, 
        default: 'none',
        enum: ['product', 'category', 'external', 'none', 'image', 'video']
    },
    status: { 
        type: String, 
        default: 'active',
        enum: ['active', 'inactive']
    },
    display_position: { 
        type: String, 
        default: 'homepage_hero' 
    },
    sort_order: { type: Number, default: 0 },
    start_date: { type: Date },
    end_date: { type: Date }
}, {
    // Tự động tạo created_at và updated_at
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Chuyển _id thành id khi trả về JSON để Frontend không bị lỗi
bannerSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
});

// Tạo Model nội bộ
const Banner = mongoose.model('Banner', bannerSchema);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- 1. Lấy danh sách (Có lọc & Phân trang) ---
exports.listBanners = async (filters = {}) => {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.display_position) query.display_position = filters.display_position;

    const limit = Number(filters.limit) || 20;
    const page = Number(filters.page) || 1;
    const skip = (page - 1) * limit;

    // Chạy song song đếm tổng và lấy dữ liệu
    const [banners, total] = await Promise.all([
        Banner.find(query)
            .sort({ sort_order: 1, created_at: -1 }) 
            .skip(skip)
            .limit(limit),
        Banner.countDocuments(query)
    ]);

    return {
        data: banners,
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
    return await Banner.findById(id);
};

// --- 3. Tạo mới ---
exports.createBanner = async (payload) => {
    // Kiểm tra payload
    if (!payload) throw new Error("Dữ liệu payload không tồn tại");

    const data = {
        title: payload.title,
        description: payload.description,
        image_url: payload.image_url,
        link: payload.link,
        link_type: payload.link_type,
        status: payload.status || 'active', // Đảm bảo luôn có giá trị
        display_position: payload.display_position || 'homepage_hero',
        sort_order: Number(payload.sort_order) || 0,
        start_date: payload.start_date,
        end_date: payload.end_date
    };

    return await Banner.create(data);
};

// --- 4. Cập nhật ---
exports.updateBanner = async (id, payload) => {
    if (!isValidId(id)) return null;

    // Mongoose tự động chỉ update các trường có trong payload
    // { new: true } -> Trả về dữ liệu mới sau update
    const updatedBanner = await Banner.findByIdAndUpdate(id, payload, { 
        new: true,
        runValidators: true 
    });

    return updatedBanner;
};

// --- 5. Xóa ---
exports.deleteBanner = async (id) => {
    if (!isValidId(id)) return false;
    const result = await Banner.findByIdAndDelete(id);
    return !!result; // Trả về true nếu xóa thành công, false nếu không tìm thấy
};
