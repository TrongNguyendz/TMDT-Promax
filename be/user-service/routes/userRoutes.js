const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');
// const profileController = require('../controllers/profileController');
// const addressController = require('../controllers/addressController');
// const upload = require('../functions/upload');
const { upload } = require('../functions/upload');  // chỉ lấy upload ra dùng

router.get('/', userController.listUsers);
router.get('/email/:email', userController.getUserByEmail);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/role', userController.updateUserRole);

// Upload avatar (1 ảnh - field name: avatar)
router.put('/:id/avatar', upload.single('avatar'), userController.updateAvatar);

// Upload nhiều ảnh và chọn một làm avatar (tối đa 5 ảnh)
router.put('/:id/avatar/multiple', upload.array('avatars', 5), userController.updateAvatarMultiple);

// router.get('/:id/profile', profileController.getProfile);
// router.put('/:id/profile', profileController.upsertProfile);

// router.get('/:id/addresses', addressController.listAddresses);
// router.post('/:id/addresses', addressController.createAddress);
// router.put('/:id/addresses/:addressId', addressController.updateAddress);
// router.delete('/:id/addresses/:addressId', addressController.deleteAddress);

module.exports = router;


