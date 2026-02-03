//hehehehe

// import axios from 'axios';
// const token = import.meta.env.VITE_AILABAPI_API_KEY;

// const postAIRequest = async (data) => {
//     const formdata = new FormData();
//     for (const key in data) {
//         formdata.append(key, data[key]);
//     }
//     return await axios.post('https://www.ailabapi.com/api/portrait/editing/try-on-clothes', formdata,
//         {
//             headers: {
//                 'ailabapi-api-key': `${token}`,
//                 // Không set Content-Type → axios tự set multipart/form-data + boundary
//             }
//         }
//     );
// }

// const getAIResponse = async (taskId) => {
//     return await axios.get('https://www.ailabapi.com/api/common/query-async-task-result',
//         {
//             headers: {
//                 'ailabapi-api-key': `${token}`,
//             }
//         },
//         { 
//             params: {
//                 task_id: taskId } }
//     );
// }

// export { postAIRequest, getAIResponse };

import axios from 'axios';
const token = import.meta.env.VITE_AILABAPI_API_KEY;

const postAIRequest = async (data) => {
    const formdata = new FormData();
    for (const key in data) {
        if (data[key] instanceof File || data[key] instanceof Blob) {
            formdata.append(key, data[key]);
        } else {
            formdata.append(key, data[key]);
        }
    }

    // ✅ FIX QUAN TRỌNG: Không set Content-Type, thêm timeout
    return await axios.post('https://www.ailabapi.com/api/portrait/editing/try-on-clothes', formdata, {
        headers: {
            'ailabapi-api-key': `${token}`,
            // ❌ KHÔNG set Content-Type → axios tự động
        },
        timeout: 60000, // 60s timeout
        // ✅ FIX CORS/File upload
        transformRequest: [(data, headers) => {
            headers['Content-Type'] = 'multipart/form-data';
            return data;
        }],
        onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percent}%`);
        }
    });
};

const getAIResponse = async (taskId) => {
    return await axios.get('https://www.ailabapi.com/api/common/query-async-task-result', {
        headers: {
            'ailabapi-api-key': `${token}`,
        },
        params: { task_id: taskId },
        timeout: 10000
    });
};

export { postAIRequest, getAIResponse };