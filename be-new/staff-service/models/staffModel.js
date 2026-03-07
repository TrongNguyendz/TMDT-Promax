const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  // Liên kết 1-1 với User (tài khoản đăng nhập)
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true,           // Bắt buộc phải có tài khoản User tương ứng
    // onDelete: 'set null' trong SQL → ở MongoDB ta xử lý logic xóa mềm hoặc set null thủ công
  },

  // Mã nhân viên (tự động tạo hoặc nhập tay: NV001, NV002...)
  staff_code: {
    type: String,
    required: [true, 'Mã nhân viên không được để trống'],
    unique: true,
    trim: true,
    uppercase: true,          // NV001, NV002... thường viết hoa
    match: [/^NV\d{3,}$/, 'Mã nhân viên phải bắt đầu bằng NV và theo sau là số (ví dụ: NV001)'],
  },

  // Họ tên (có thể đồng bộ từ User.full_name, nhưng lưu riêng để linh hoạt)
  full_name: {
    type: String,
    required: [true, 'Họ tên không được để trống'],
    trim: true,
  },

  // Vị trí công việc (tham chiếu đến collection staff_positions)
  position_id: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: 'StaffPosition',     // Giả sử bạn có model StaffPosition
    // required: false         // có thể để optional nếu chưa có vị trí
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    sparse: true,             // cho phép null, nhưng nếu có thì phải unique
    match: [/.+@.+\..+/, 'Email không hợp lệ'],
  },

  phone: {
    type: String,
    trim: true,
    match: [/^0[1-9]\d{8,9}$/, 'Số điện thoại không hợp lệ (ví dụ: 0912345678)'],
  },

  avatar_url: {
    type: String,
    trim: true,
  },

  hire_date: {
    type: Date,
    // required: true,        // có thể để optional nếu chưa có ngày vào làm
  },

  status: {
    type: String,
    enum: ['active', 'suspended', 'resigned'],
    default: 'active',
    lowercase: true,
  },

  notes: {
    type: String,
    trim: true,
  },

  // Theo dõi thời gian
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// ─── Indexes ────────────────────────────────────────────────
StaffSchema.index({ staff_code: 1 });
StaffSchema.index({ user_id: 1 });
StaffSchema.index({ email: 1 });
StaffSchema.index({ status: 1 });
StaffSchema.index({ position_id: 1 });

// ─── Pre-save hook: tự động cập nhật updated_at ─────────────
StaffSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

// ─── Helper: loại bỏ các field nhạy cảm khi trả về ──────────
const sanitizeStaff = (staff) => {
  if (!staff) return null;
  const obj = staff.toObject ? staff.toObject() : staff;
  // Loại bỏ field không cần thiết khi expose ra API (nếu có)
  const { __v, ...safe } = obj;
  return safe;
};

// ─── Static & Instance methods ──────────────────────────────
StaffSchema.statics.sanitize = sanitizeStaff;

StaffSchema.statics.findByStaffCode = function (code) {
  return this.findOne({ staff_code: code.toUpperCase() }).lean();
};

StaffSchema.statics.findByUserId = function (userId) {
  return this.findOne({ user_id: userId }).populate('position_id').lean();
};

StaffSchema.statics.listStaff = async function (filters = {}) {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.position_id) query.position_id = filters.position_id;
  if (filters.search) {
    query.$or = [
      { full_name: { $regex: filters.search, $options: 'i' } },
      { staff_code: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.find(query)
      .populate('position_id', 'name code') // populate tên vị trí nếu cần
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query),
  ]);

  return {
    data: data.map(sanitizeStaff),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};
// ─── CREATE (Thêm nhân viên mới) ────────────────────────────────────────
StaffSchema.statics.createStaff = async function (data) {
  try {
    // Kiểm tra các trường bắt buộc cơ bản
    if (!data.user_id) {
      throw new Error('user_id là bắt buộc (phải liên kết với User)');
    }
    if (!data.staff_code) {
      throw new Error('Mã nhân viên là bắt buộc');
    }
    if (!data.full_name) {
      throw new Error('Họ tên là bắt buộc');
    }

    // Chuẩn hóa staff_code
    const staffCode = data.staff_code.trim().toUpperCase();
    if (!/^NV\d{3,}$/.test(staffCode)) {
      throw new Error('Mã nhân viên phải bắt đầu bằng NV và theo sau là ít nhất 3 chữ số');
    }

    // Kiểm tra trùng lặp trước khi tạo
    const existing = await this.findOne({
      $or: [
        { staff_code: staffCode },
        { user_id: data.user_id },
        ...(data.email ? [{ email: data.email.toLowerCase().trim() }] : []),
      ],
    });

    if (existing) {
      if (existing.staff_code === staffCode) {
        throw new Error('Mã nhân viên đã tồn tại');
      }
      if (existing.user_id.toString() === data.user_id.toString()) {
        throw new Error('User này đã được liên kết với một nhân viên khác');
      }
      if (data.email && existing.email === data.email.toLowerCase().trim()) {
        throw new Error('Email đã được sử dụng bởi nhân viên khác');
      }
    }

    const staff = new this({
      ...data,
      staff_code: staffCode,
      email: data.email ? data.email.toLowerCase().trim() : undefined,
      status: data.status || 'active',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await staff.save();

    // Trả về document đã populate position (nếu có)
    return this.findById(staff._id)
      .populate('position_id', 'name code')
      .lean()
      .then(sanitizeStaff);
  } catch (err) {
    throw new Error(err.message || 'Không thể tạo nhân viên mới');
  }
};

// ─── UPDATE (Cập nhật thông tin nhân viên) ───────────────────────────────
StaffSchema.statics.updateStaff = async function (staffId, updateData) {
  try {
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      throw new Error('ID nhân viên không hợp lệ');
    }

    const staff = await this.findById(staffId);
    if (!staff) {
      throw new Error('Không tìm thấy nhân viên');
    }

    // Các trường cho phép cập nhật
    const allowedFields = [
      'full_name', 'position_id', 'email', 'phone', 'avatar_url',
      'hire_date', 'status', 'notes'
    ];

    // Chuẩn hóa và validate một số trường đặc biệt
    if (updateData.staff_code) {
      throw new Error('Không được thay đổi mã nhân viên (staff_code là duy nhất và cố định)');
    }

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
      const emailExists = await this.findOne({
        email: updateData.email,
        _id: { $ne: staff._id },
      });
      if (emailExists) {
        throw new Error('Email đã được sử dụng bởi nhân viên khác');
      }
    }

    if (updateData.phone) {
      if (!/^0[1-9]\d{8,9}$/.test(updateData.phone)) {
        throw new Error('Số điện thoại không hợp lệ');
      }
    }

    // Chỉ cập nhật các field được phép
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        staff[field] = updateData[field];
      }
    });

    staff.updated_at = new Date();
    await staff.save();

    // Trả về sau khi populate
    return this.findById(staff._id)
      .populate('position_id', 'name code')
      .lean()
      .then(sanitizeStaff);
  } catch (err) {
    throw new Error(err.message || 'Không thể cập nhật thông tin nhân viên');
  }
};

// ─── DELETE (Xóa mềm - soft delete) ─────────────────────────────────────
StaffSchema.statics.deleteStaff = async function (staffId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      throw new Error('ID nhân viên không hợp lệ');
    }

    const staff = await this.findById(staffId);
    if (!staff) {
      throw new Error('Không tìm thấy nhân viên');
    }

    if (staff.status === 'resigned') {
      throw new Error('Nhân viên đã nghỉ việc trước đó');
    }

    staff.status = 'resigned';
    staff.updated_at = new Date();
    await staff.save();

    return {
      success: true,
      message: 'Đã chuyển nhân viên sang trạng thái nghỉ việc (resigned)',
      staff: sanitizeStaff(staff),
    };
  } catch (err) {
    throw new Error(err.message || 'Không thể xóa nhân viên');
  }
};

// ─── HARD DELETE (Xóa vĩnh viễn - dùng cẩn thận!) ────────────────────────
StaffSchema.statics.hardDeleteStaff = async function (staffId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      throw new Error('ID nhân viên không hợp lệ');
    }

    const staff = await this.findByIdAndDelete(staffId);
    if (!staff) {
      throw new Error('Không tìm thấy nhân viên để xóa');
    }

    return {
      success: true,
      message: 'Đã xóa nhân viên vĩnh viễn',
      deletedStaffCode: staff.staff_code,
    };
  } catch (err) {
    throw new Error(err.message || 'Không thể xóa vĩnh viễn nhân viên');
  }
};
// Export model và helpers
const Staff = mongoose.model('Staff', StaffSchema);

module.exports = {
  Staff,
  sanitizeStaff,
  // Có thể export thêm các hàm khác nếu cần
};