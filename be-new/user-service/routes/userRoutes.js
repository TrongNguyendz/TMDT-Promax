const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');
const { upload,validateImageContent } = require('../functions/upload');  // chỉ lấy upload ra dùng

router.get('/', userController.listUsers);
router.get('/email/:email', userController.getUserByEmail);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/role', userController.updateUserRole);

// Upload avatar (1 ảnh - field name: avatar)
router.put('/:id/avatar', upload.single('avatar'), validateImageContent, userController.updateAvatar);

// Upload nhiều ảnh và chọn một làm avatar (tối đa 5 ảnh)
router.put('/:id/avatar/multiple', upload.array('avatars', 5), validateImageContent, userController.updateAvatarMultiple);


module.exports = router;


