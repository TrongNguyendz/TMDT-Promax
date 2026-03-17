import axios from "axios";

const OPEN_API = "https://provinces.open-api.vn/api";

// 1. Lấy toàn bộ Tỉnh/Thành
export const getProvinces = async () => {
  try {
    const res = await axios.get(`${OPEN_API}/p/`);
    return res.data; // Trả về mảng các tỉnh
  } catch (error) {
    console.error("🔥 ERROR getProvinces:", error);
    throw error;
  }
};

// 2. Lấy danh sách Huyện của một Tỉnh
export const getDistricts = async (provinceCode) => {
  try {
    // Gọi vào endpoint Tỉnh kèm depth=2 để lấy danh sách huyện bên trong
    const res = await axios.get(`${OPEN_API}/p/${provinceCode}?depth=2`);
    return res.data.districts; // Trả về mảng districts
  } catch (error) {
    console.error("🔥 ERROR getDistricts:", error);
    throw error;
  }
};

// 3. Lấy danh sách Xã của một Huyện
export const getWards = async (districtCode) => {
  try {
    // Gọi vào endpoint Huyện kèm depth=2 để lấy danh sách xã bên trong
    const res = await axios.get(`${OPEN_API}/d/${districtCode}?depth=2`);
    return res.data.wards; // Trả về mảng wards
  } catch (error) {
    console.error("🔥 ERROR getWards:", error);
    throw error;
  }
};