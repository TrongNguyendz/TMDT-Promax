import axios from "axios";

export const postuserCategoryInteraction = async (payload, token) => {
  // payload là object { categoryId, userId, ... }

  try {
    const response = await axios.post(
      "https://tmdt-promax-api-gateway.onrender.com/api/v1/user-category/click",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // nếu backend dùng JWT trong header thì thêm vào đây
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Full error response:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// user-category.js
export const getRecentCategoryIds = async (userId, token) => {
  const response = await axios.get(
    `https://tmdt-promax-api-gateway.onrender.com/api/v1/user-category/recent`, 
    {
      params: { userId: userId }, // Nó sẽ tạo ra dạng ?userId=1000
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data.data; 
};
