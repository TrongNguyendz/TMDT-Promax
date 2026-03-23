import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import OrderService from '../utils/order_service_api'; // [CHANGE] Import API Adapter
import { useUserStore } from './user';
import { useUIStore } from './ui';

export const useWishlistStore = defineStore('wishlist', () => {
  // STATE 
  const items = ref([]); 
  const loading = ref(false);

  // GETTERS
  const count = computed(() => items.value.length);

  const isInWishlist = (productId) => {
    return items.value.some(item => (item.product_id || item.id) === productId);
  };


  //  1. Hàm tải danh sách từ Database Server
  const fetchWishlist = async () => {
    const userStore = useUserStore();
    
    // Nếu chưa đăng nhập -> Làm rỗng list
    if (!userStore.profile?.id) {
        items.value =[];
        return;
    }

    loading.value = true;
    try {
        const res = await OrderService.getWishlist(userStore.profile.id);
        if (res.data.success) {
            items.value = res.data.data;
        }
    } catch (error) {
        console.error('Lỗi tải wishlist:', error);
    } finally {
        loading.value = false;
    }
  };

  // 2. Logic Thêm/Xóa gọi API
  const toggleWishlist = async (product) => {
    if (!product?.id) return;

    const userStore = useUserStore();
    const uiStore = useUIStore();
    // Bắt buộc lấy ID người dùng
    const userId = userStore.profile?.id;
    if (!userId) {
      uiStore.pushToast({ type: 'warning', message: 'Vui lòng đăng nhập để sử dụng Wishlist' });
      return;
    }

    if (loading.value) return;
    loading.value = true;

    const currentlyIn = isInWishlist(product.id);

    try {
      if (currentlyIn) {
        // GỌI API XÓA KHỎI DATABASE
        await OrderService.removeFromWishlist(userId, product.id);

        // Xóa local UI
        items.value = items.value.filter(
          item => (item.product_id || item.id) !== product.id
        );
        uiStore.pushToast({ type: 'info', message: 'Đã xóa khỏi danh sách yêu thích' });
      } else {
        // GỌI API THÊM VÀO DATABASE
        await OrderService.addToWishlist(userId, product.id);

        // Thêm local UI ngay lập tức 
        items.value.unshift({
          id: product.id,
          product_id: product.id, // Lưu kèm product_id để Backend mapping
          ...product
        });
        uiStore.pushToast({ type: 'success', message: 'Đã thêm vào danh sách yêu thích ❤️' });
      }
    } catch (error) {
      uiStore.pushToast({ type: 'error', message: 'Lỗi cập nhật Wishlist' });
      // Nếu API lỗi, tải lại list từ server để đồng bộ lại
      await fetchWishlist();
    } finally {
      loading.value = false;
    }
  };

  // Hàm clear chạy khi người dùng Logout
  const clear = () => {
    items.value =[];
  };

  return {
    items,
    loading,
    count,
    isInWishlist,
    fetchWishlist,
    toggleWishlist,
    clear
  };
}, 
{});