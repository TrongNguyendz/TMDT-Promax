// shift-api.js
import axios from "axios";

/**
 * Lấy danh sách ca làm việc (shifts)
 * GET /api/v1/shifts
 */
export const getListShifts = async ( token) => {
    if (!token) throw new Error('Token is required');

    return await axios.get(
        'https://tmdt-promax-api-gateway.onrender.com/api/v1/shifts',
        {
            // params, // hỗ trợ query params: page, limit, staff_id, status, start_date, end_date, search,...
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};

/**
 * Lấy chi tiết một ca làm việc theo ID
 * GET /api/v1/shifts/:id
 */
export const getShiftById = async (id, token) => {
    if (!token) throw new Error('Token is required');
    if (!id) throw new Error('Shift ID is required');

    return await axios.get(
        `https://tmdt-promax-api-gateway.onrender.com/api/v1/shifts/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};

/**
 * Tạo ca làm việc mới
 * POST /api/v1/shifts
 */
export const createShift = async (data, token) => {
    if (!token) throw new Error('Token is required');

    return await axios.post(
        'https://tmdt-promax-api-gateway.onrender.com/api/v1/shifts',
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
 * Cập nhật ca làm việc
 * PUT /api/v1/shifts/:id
 */
export const updateShift = async (id, data, token) => {
    if (!token) throw new Error('Token is required');
    if (!id) throw new Error('Shift ID is required');

    return await axios.put(
        `https://tmdt-promax-api-gateway.onrender.com/api/v1/shifts/${id}`,
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
 * Hủy ca làm việc (soft delete - status = cancelled)
 * DELETE /api/v1/shifts/:id
 */
export const deleteShift = async (id, token) => {
    if (!token) throw new Error('Token is required');
    if (!id) throw new Error('Shift ID is required');

    return await axios.delete(
        `https://tmdt-promax-api-gateway.onrender.com/api/v1/shifts/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};

/**
 * Xóa cứng ca làm việc (hard delete)
 * DELETE /api/v1/shifts/:id/hard
 */
export const hardDeleteShift = async (id, token) => {
    if (!token) throw new Error('Token is required');
    if (!id) throw new Error('Shift ID is required');

    return await axios.delete(
        `https://tmdt-promax-api-gateway.onrender.com/api/v1/shifts/${id}/hard`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};

// /**
//  * (Tùy chọn) Check-in ca làm việc (cập nhật actual_start)
//  * PUT /api/v1/shifts/:id/checkin
//  * Body: { actual_start: "08:15:00" }
//  */
// export const checkInShift = async (id, data, token) => {
//     if (!token) throw new Error('Token is required');
//     if (!id) throw new Error('Shift ID is required');

//     return await axios.put(
//         `http://localhost:3000/api/v1/shifts/${id}/checkin`,
//         data,
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         }
//     );
// };

// /**
//  * (Tùy chọn) Check-out ca làm việc (cập nhật actual_end)
//  * PUT /api/v1/shifts/:id/checkout
//  * Body: { actual_end: "17:05:00" }
//  */
// export const checkOutShift = async (id, data, token) => {
//     if (!token) throw new Error('Token is required');
//     if (!id) throw new Error('Shift ID is required');

//     return await axios.put(
//         `http://localhost:3000/api/v1/shifts/${id}/checkout`,
//         data,
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         }
//     );
// };