import axios from "axios"; 

export const getListBanners = async () => {
    // if (!token) throw new Error('Token is required');
    return await axios.get('https://tmdt-promax-api-gateway.onrender.com/api/v1/admin/banners');
}


export const updateBanner = async (id, data, token) => {
    if (!token) throw new Error('Token is required');

    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    return await axios.put(`https://tmdt-promax-api-gateway.onrender.com/api/v1/admin/banners/${id}`, formData,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                // Không set Content-Type → axios tự set multipart/form-data + boundary
            }
        }
    );
}


export const createBanner = async (data, token) => {
    if (!token) throw new Error('Token is required');
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    return await axios.post('https://tmdt-promax-api-gateway.onrender.com/api/v1/admin/banners', formData,
        {
            headers: { 
                'Authorization': `Bearer ${token}`,
                // Không set Content-Type → axios tự set multipart/form-data + boundary
            }
        }
    );
};

export const deleteBannerhehe = async (id, token) => {
    if (!token) throw new Error('Token is required');
    return await axios.delete(`https://tmdt-promax-api-gateway.onrender.com/api/v1/admin/banners/${id}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        }
    );
}