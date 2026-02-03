import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from './user';
import { useUIStore } from './ui';

export const useWishlistStore = defineStore('wishlist', () => {
  // STATE - lưu local (persist tự động nếu dùng plugin)
  const items = ref([]); // [{ product_id, id, name, price, image, ... }]
  const loading = ref(false);

  // GETTERS
  const count = computed(() => items.value.length);

  const isInWishlist = (productId) => {
    return items.value.some(item => item.product_id === productId || item.id === productId);
  };

  // ACTIONS
  const toggleWishlist = async (product) => {
    if (!product?.id) return;

    const userStore = useUserStore();
    const uiStore = useUIStore();

    // Nếu chưa đăng nhập → yêu cầu login (vẫn giữ logic này)
    if (!userStore.isAuthenticated) {
      uiStore.pushToast({ type: 'warning', message: 'Vui lòng đăng nhập để sử dụng Wishlist' });
      return;
    }

    if (loading.value) return;
    loading.value = true;

    const currentlyIn = isInWishlist(product.id);

    try {
      if (currentlyIn) {
        // Xóa local
        items.value = items.value.filter(
          item => item.product_id !== product.id && item.id !== product.id
        );
        uiStore.pushToast({ type: 'info', message: 'Đã xóa khỏi danh sách yêu thích' });
      } else {
        // Thêm local
        items.value.unshift({
          id: product.id,
          product_id: product.id,
          ...product
        });
        uiStore.pushToast({ type: 'success', message: 'Đã thêm vào danh sách yêu thích ❤️' });
      }
    } catch (error) {
      uiStore.pushToast({ type: 'error', message: 'Lỗi cập nhật Wishlist' });
    } finally {
      loading.value = false;
    }
  };

  const clear = () => {
    items.value = [];
  };

  return {
    items,
    loading,
    count,
    isInWishlist,
    toggleWishlist,
    clear
  };
}, {
  persist: true // Nếu dùng pinia-plugin-persistedstate → wishlist giữ lại sau refresh
});