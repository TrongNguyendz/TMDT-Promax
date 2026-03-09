import axios from "axios";

/**
 * Lấy danh sách staff
 */
export const getListStaff = async (token) => {
    if (!token) throw new Error('Token is required');

    return await axios.get(
        'http://localhost:3000/api/v1/staff',
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};


/**
 * Lấy chi tiết staff theo ID
 */
export const getStaffById = async (id, token) => {
    if (!token) throw new Error('Token is required');

    return await axios.get(
        `http://localhost:3000/api/v1/staff/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};


/**
 * Lấy staff theo code (NV001...)
 */
export const getStaffByCode = async (code, token) => {
    if (!token) throw new Error('Token is required');

    return await axios.get(
        `http://localhost:3000/api/v1/staff/code/${code}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};


/**
 * Tạo staff mới
 */
export const createStaff = async (data, token) => {
    if (!token) throw new Error('Token is required');

    return await axios.post(
        'http://localhost:3000/api/v1/staff',
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
};


/**
 * Cập nhật staff
 */
export const updateStaff = async (id, data, token) => {
    if (!token) throw new Error('Token is required');

    return await axios.put(
        `http://localhost:3000/api/v1/staff/${id}`,
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
};


/**
 * Xóa mềm staff
 */
export const deleteStaff = async (id, token) => {
    if (!token) throw new Error('Token is required');

    return await axios.delete(
        `http://localhost:3000/api/v1/staff/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};


/**
 * Xóa cứng staff
 */
export const hardDeleteStaff = async (id, token) => {
    if (!token) throw new Error('Token is required');

    return await axios.delete(
        `http://localhost:3000/api/v1/staff/${id}/hard`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};


/**
 * Upload avatar staff
 */
export const uploadStaffAvatar = async (id, file, token) => {
    if (!token) throw new Error('Token is required');

    const formData = new FormData();
    formData.append("avatar", file);

    return await axios.put(
        `http://localhost:3000/api/v1/staff/${id}/avatar`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`
                // axios tự set multipart/form-data
            }
        }
    );
};