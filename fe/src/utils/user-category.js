import axios from "axios"; 

export const postuserCategoryInteraction = async (payload,token) => {
  // payload là object { categoryId, userId, ... }

  try {
    const response = await axios.post('http://localhost:3000/api/v1/user-category/click', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`   // nếu backend dùng JWT trong header thì thêm vào đây
      }
    });
    return response.data;
  } catch (error) {
    console.error('Full error response:', error.response?.data || error.message);
    throw error;
  }
};

export const getRecentCategoryIds = async (userId, token) => {
    if (!token) throw new Error('Token is required');
    return await axios.get(
        `http://localhost:3000/api/v1/user-category/recent`,
        { "userId": userId },
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }, 
        }
    );
}
