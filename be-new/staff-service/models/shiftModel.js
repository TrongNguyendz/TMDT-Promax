const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  // ID tự tăng (bắt đầu từ 3000 để phân biệt với các collection khác)
  id: {
    type: Number,
    unique: true
  },

  // Liên kết với nhân viên
  staff_id: {
    type: Number,
    required: [true, 'staff_id là bắt buộc'],
    ref: 'Staff' // chỉ để tham chiếu, không dùng populate mặc định
  },

  shift_date: {
    type: Date,
    required: [true, 'Ngày ca làm việc là bắt buộc']
  },

  start_time: {
    type: String, // lưu dạng "08:00:00" hoặc "08:00"
    required: [true, 'Giờ bắt đầu là bắt buộc']
  },

  end_time: {
    type: String,
    required: [true, 'Giờ kết thúc là bắt buộc']
  },

  shift_type: {
    type: String,
    enum: ['morning', 'afternoon', 'full-day', 'custom', 'night'],
    default: 'full-day'
  },

  actual_start: {
    type: String // "HH:mm:ss" hoặc null
  },

  actual_end: {
    type: String
  },

  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'absent', 'cancelled'],
    default: 'scheduled'
  },

  notes: {
    type: String,
    trim: true
  },
  
  // Thêm trường mới: màu hiển thị ca (ví dụ: cho lịch calendar)
  color: {
    type: String,
    default: '#3b82f6',  // Màu xanh dương mặc định (Tailwind blue-500)
    trim: true,
    match: [/^#[0-9A-Fa-f]{6}$/, 'Màu phải là hex 6 ký tự (ví dụ: #3b82f6)'] // validation tùy chọn
  },

  created_at: {
    type: Date,
    default: Date.now
  },

  updated_at: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Tự động tăng id
ShiftSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  try {
    const lastShift = await this.constructor.findOne()
      .sort({ id: -1 })
      .select('id')
      .lean();

    this.id = lastShift && lastShift.id ? lastShift.id + 1 : 3000;
    next();
  } catch (err) {
    next(err);
  }
});

// ====================== STATIC METHODS ======================

// Danh sách ca (có filter & phân trang)
ShiftSchema.statics.listShifts = async function (filters = {}) {
  const query = {};

  if (filters.staff_id)   query.staff_id = Number(filters.staff_id);
  if (filters.status)     query.status = filters.status;
  if (filters.shift_type) query.shift_type = filters.shift_type;

  // Tìm theo khoảng ngày
  if (filters.start_date || filters.end_date) {
    query.shift_date = {};
    if (filters.start_date) query.shift_date.$gte = new Date(filters.start_date);
    if (filters.end_date)   query.shift_date.$lte = new Date(filters.end_date);
  }

  // Tìm kiếm text (notes hoặc shift_type)
  if (filters.search) {
    query.$or = [
      { notes: { $regex: filters.search, $options: 'i' } },
      { shift_type: { $regex: filters.search, $options: 'i' } }
    ];
  }

  const page  = Number(filters.page)  || 1;
  const limit = Number(filters.limit) || 20;
  const skip  = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.find(query)
      .sort({ shift_date: -1, start_time: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

// Tạo ca mới
// Tạo ca mới (cập nhật nhẹ)
ShiftSchema.statics.createShift = async function (data) {
  const requiredFields = ['staff_id', 'shift_date', 'start_time', 'end_time'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`${field} là bắt buộc`);
    }
  }

  // Kiểm tra trùng ca...
  const conflict = await this.findOne({
    staff_id: data.staff_id,
    shift_date: data.shift_date,
    start_time: data.start_time
  });

  if (conflict) {
    throw new Error('Nhân viên đã có ca trùng thời gian trong ngày này');
  }

  // Nếu client gửi color không hợp lệ, có thể fallback về default (tùy chọn)
  const finalData = {
    ...data,
    color: data.color || '#3b82f6'  // đảm bảo luôn có color
  };

  const shift = new this(finalData);
  await shift.save();
  return shift;
};

// Cập nhật ca
ShiftSchema.statics.updateShift = async function (id, data) {
  const shift = await this.findOne({ id: Number(id) });
  if (!shift) throw new Error('Không tìm thấy ca làm việc');

  const allowed = [
    'shift_date', 'start_time', 'end_time', 'shift_type',
    'actual_start', 'actual_end', 'status', 'notes',
    'color' // cho phép cập nhật màu ca
  ];

  allowed.forEach(field => {
    if (data[field] !== undefined) {
      shift[field] = data[field];
    }
  });

  await shift.save();
  return shift;
};

// Xóa mềm
ShiftSchema.statics.deleteShift = async function (id) {
  const shift = await this.findOne({ id: Number(id) });
  if (!shift) throw new Error('Không tìm thấy ca làm việc');

  shift.status = 'cancelled';
  await shift.save();

  return { success: true, message: 'Đã hủy ca làm việc' };
};

// Xóa cứng
ShiftSchema.statics.hardDeleteShift = async function (id) {
  const shift = await this.findOneAndDelete({ id: Number(id) });
  if (!shift) throw new Error('Không tìm thấy ca làm việc');

  return { success: true, message: 'Đã xóa vĩnh viễn ca làm việc' };
};

const Shift = mongoose.model('Shift', ShiftSchema);

module.exports = { Shift };