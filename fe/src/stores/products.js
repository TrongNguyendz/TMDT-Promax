import { defineStore } from 'pinia';
// Đảm bảo import đúng file api của product service
import api from '../utils/product_service_api'; 

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],           // Danh sách sản phẩm
    categories: [],         // Danh sách danh mục
    currentProduct: null,   // Chi tiết 1 sản phẩm
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 1
    },
    loading: false,
    error: null,
  }),

  getters: {
    // Getter lấy ảnh đại diện an toàn
    getProductThumbnail: () => (product) => {
      if (product.images && product.images.length > 0) {
        const primary = product.images.find(img => img.is_primary);
        return primary ? primary.image_url : product.images[0].image_url;
      }
      // Fallback ảnh mặc định nếu không có ảnh
      return 'https://via.placeholder.com/100x100?text=No+Img';
    }
  },

  actions: {
    // 1. Lấy danh sách sản phẩm (Hàm quan trọng nhất đang bị thiếu)
    async fetchProducts(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/products', { params });
        
        // Cập nhật state từ response backend
        this.products = response.data.data || [];
        if (response.data.pagination) {
            this.pagination = response.data.pagination;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Lỗi tải danh sách';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    // 2. Tương thích ngược (Nếu có file nào lỡ gọi fetchList thì trỏ nó về fetchProducts)
    async fetchList(params = {}) {
        return this.fetchProducts(params);
    },

    // 3. Lấy chi tiết sản phẩm
    async fetchProductById(id) {
      this.loading = true;
      this.currentProduct = null;
      try {
        const response = await api.get(`/products/${id}`);
        this.currentProduct = response.data.data;
      } catch (err) {
        this.error = 'Lỗi tải chi tiết';
      } finally {
        this.loading = false;
      }
    },

    // 4. Lấy danh mục
    async fetchCategories() {
      try {
        const response = await api.get('/categories');
        this.categories = response.data.data || [];
      } catch (err) {
        console.error(err);
      }
    },

    // 5. Tạo sản phẩm
    async createProduct(formData) {
      this.loading = true;
      try {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await this.fetchProducts(); // Load lại danh sách sau khi tạo
        return { success: true };
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Lỗi tạo' };
      } finally {
        this.loading = false;
      }
    },

    // 6. Cập nhật sản phẩm
    async updateProduct(id, formData) {
      this.loading = true;
      try {
        await api.put(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await this.fetchProducts();
        return { success: true };
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Lỗi cập nhật' };
      } finally {
        this.loading = false;
      }
    },

    // 7. Xóa sản phẩm
    async deleteProduct(id) {
      this.loading = true;
      try {
        await api.delete(`/products/${id}`);
        this.products = this.products.filter(p => p.id !== id);
        return { success: true };
      } catch (err) {
        return { success: false, message: 'Lỗi xóa' };
      } finally {
        this.loading = false;
      }
    },

    // 8. Tạo danh mục nhanh
    async createCategory(data) {
        try {
            await api.post('/categories', data);
            await this.fetchCategories();
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }, 

	 async addReview(productId, reviewData) {
        try {
            // reviewData gồm: { user_id, rating, comment, title }
            await api.post(`/products/${productId}/reviews`, reviewData);
            // Reload lại danh sách review của sản phẩm đó
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Lỗi gửi đánh giá' };
        }
    },

   async deleteCategory(id) {
        if(!confirm('Bạn chắc chắn muốn xóa danh mục này?')) return;
        try {
            await api.delete(`/categories/${id}`);
            await this.fetchCategories(); // Load lại danh sách
            return { success: true };
        } catch (e) {
            return { success: false, message: e.response?.data?.message || 'Lỗi xóa' };
        }
    }
   
  }
});