const UserModel = require('../models/userModel');
const { hashPassword } = require('../functions/password');
const { deleteOldAvatar } = require('../functions/upload');


exports.healthCheck = (_req, res) => {
  res.json({
    status: 'UP',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
}

// Cập nhật avatar người dùng (1 ảnh)
// exports.updateAvatar = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'Không tìm thấy người dùng'
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'Vui lòng upload file avatar'
//       });
//     }

//     const avatarUrl = `/uploads/${req.file.filename}`;

//     const updatedUser = await UserModel.updateUser(userId, { avatar_url: avatarUrl });

//     res.json({
//       success: true,
//       message: 'Cập nhật avatar thành công',
//       data: UserModel.sanitizeUser(updatedUser)
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Không thể cập nhật avatar',
//       error: error.message
//     });
//   }
// };

// Cập nhật avatar (1 ảnh)
exports.updateAvatar = async (req, res) => {
  try {
    const userId = Number(req.params.id); // giữ string, helper sẽ Number() bên trong

    const user = await UserModel.findById(userId);   // ← ĐÚNG cách
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload file avatar'
      });
    }

    const newAvatarUrl = `/uploads/${req.file.filename}`;

    if (user.avatar_url) {
      deleteOldAvatar(user.avatar_url);
    }

    const updatedUser = await UserModel.updateUser(userId, { avatar_url: newAvatarUrl });

    if (!updatedUser) {
      return res.status(500).json({ success: false, message: 'Cập nhật thất bại' });
    }

    res.json({
      success: true,
      message: 'Cập nhật avatar thành công',
      data: UserModel.sanitizeUser(updatedUser)
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật avatar',
      error: error.message
    });
  }
};

// Upload nhiều ảnh và chọn một làm avatar
exports.updateAvatarMultiple = async (req, res) => {
  try {
    const userId = req.params.id;
    const selectedIndex = parseInt(req.body.selectedIndex) || 0; // Index của ảnh được chọn (mặc định ảnh đầu tiên)

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // req.files là array khi dùng upload.array()
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload ít nhất một file avatar'
      });
    }

    // Kiểm tra selectedIndex hợp lệ
    if (selectedIndex < 0 || selectedIndex >= req.files.length) {
      return res.status(400).json({
        success: false,
        message: `selectedIndex phải từ 0 đến ${req.files.length - 1}`
      });
    }

    // Lấy ảnh được chọn làm avatar
    const selectedFile = req.files[selectedIndex];
    const avatarUrl = `/uploads/${selectedFile.filename}`;

    // Lấy danh sách URL của tất cả ảnh đã upload
    const uploadedUrls = req.files.map(file => `/uploads/${file.filename}`);

    // Cập nhật avatar_url trong database
    const updatedUser = await UserModel.updateUser(userId, { avatar_url: avatarUrl });

    res.json({
      success: true,
      message: `Upload ${req.files.length} ảnh thành công, đã chọn ảnh thứ ${selectedIndex + 1} làm avatar`,
      data: {
        user: UserModel.sanitizeUser(updatedUser),
        uploadedImages: uploadedUrls,
        selectedAvatar: avatarUrl,
        selectedIndex
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật avatar',
      error: error.message
    });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const result = await UserModel.listUsers(req.query);
    res.json({
      success: true,
      // data: result.data.map(UserModel.sanitizeUser),
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách người dùng',
      error: error.message
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    // const IdFromToken = req.user.id;
    // if (IdFromToken !== req.params.id) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Forbidden: bạn không có quyền truy cập người dùng này'
    //   });
    // }
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.json({ success: true, data: UserModel.sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin người dùng',
      error: error.message
    });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const user = await UserModel.findByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.json({ success: true, data: UserModel.sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy người dùng theo email',
      error: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (req.body.email && req.body.email !== user.email) {
      const existingEmail = await UserModel.findByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
      }
    }

    if (req.body.username && req.body.username !== user.username) {
      const existingUsername = await UserModel.findByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ success: false, message: 'Username đã tồn tại' });
      }
    }

    const updatePayload = {
      username: req.body.username,
      email: req.body.email,
      full_name: req.body.full_name,
      phone: req.body.phone,
      avatar_url: req.body.avatar_url,
    };

    if (req.body.password) {
      updatePayload.password_hash = await hashPassword(req.body.password);
    }


    const updatedUser = await UserModel.updateUser(req.params.id, updatePayload);
    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: UserModel.sanitizeUser(updatedUser)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật người dùng',
      error: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deleted = await UserModel.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.json({ success: true, message: 'Xóa người dùng thành công' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa người dùng',
      error: error.message
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    const updatedUser = await UserModel.updateRole(req.params.id, req.body.role);
    res.json({
      success: true,
      message: 'Cập nhật vai trò người dùng thành công',
      data: UserModel.sanitizeUser(updatedUser)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật vai trò người dùng',
      error: error.message
    });
  }
};