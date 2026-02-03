import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUIStore } from './ui';

export const useCartStore = defineStore('cart', () => {
    // --- STATE ---
    const items = ref([]); 

    // --- GETTERS ---
    const itemCount = computed(() => {
        return items.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    });

    const subtotal = computed(() => {
        return items.value.reduce((sum, item) => {
            return sum + (Number(item.price) * Number(item.quantity));
        }, 0);
    });

    // --- ACTIONS ---

    // 1. Thêm vào giỏ (Logic thông minh: Phân biệt Màu/Size)
    const addToCart = (product, quantity = 1) => {
        const uiStore = useUIStore();
        
        // Validate tồn kho cơ bản
        if (product.stock_quantity !== undefined && product.stock_quantity <= 0) {
            uiStore.pushToast({ type: 'error', message: 'Sản phẩm đã hết hàng!' });
            return;
        }

        // 🟢 QUAN TRỌNG: Tìm sản phẩm trùng khớp cả ID + MÀU + SIZE
        const existingItem = items.value.find(i => 
            i.product_id === product.id && 
            i.color === product.selectedColor && 
            i.size === product.selectedSize
        );
        
        if (existingItem) {
            // Nếu trùng hoàn toàn -> Cộng dồn số lượng
            existingItem.quantity += quantity;
            uiStore.pushToast({ type: 'info', message: 'Đã cập nhật số lượng trong giỏ' });
        } else {
            // Nếu khác màu hoặc size -> Thêm dòng mới
            items.value.push({
                // Định danh
                product_id: product.id,
                
                // Snapshot thông tin (Lưu cứng để hiển thị & thanh toán)
                product_name: product.name,
                product_image: product.image, // Ảnh theo màu đã chọn ở Detail
                price: Number(product.price),
                
                // Thuộc tính biến thể
                color: product.selectedColor || null,
                size: product.selectedSize || null,
                
                quantity: Number(quantity),
                stock: product.stock_quantity // Lưu stock để giới hạn số lượng tăng thêm
            });
            
            uiStore.pushToast({ type: 'success', message: 'Đã thêm vào giỏ hàng' });
        }
    };

    // 2. Cập nhật số lượng (+ / -)
    const updateQuantity = (item, newQty) => {
        if (newQty < 1) return;
        if (item.stock && newQty > item.stock) {
            useUIStore().pushToast({ type: 'warning', message: `Kho chỉ còn ${item.stock} sản phẩm` });
            return;
        }
        item.quantity = Number(newQty);
    };

    // 3. Xóa sản phẩm
    const removeItem = (itemToRemove) => {
        const index = items.value.indexOf(itemToRemove);
        if (index > -1) {
items.value.splice(index, 1);
            useUIStore().pushToast({ type: 'info', message: 'Đã xóa sản phẩm' });
        }
    };

    // 4. Xóa sạch giỏ
    const clearCart = () => {
        items.value = [];
    };

    return {
        items,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart
    };
}, {
    persist: {
        key: 'shopping-cart',
        storage: localStorage,
        paths: ['items']
    }
});