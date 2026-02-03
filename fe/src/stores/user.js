import { defineStore } from 'pinia';
import { useWishlistStore } from './wishlist';
import { useCartStore } from './cart';

export const useUserStore = defineStore('user', {
	state: () => ({
		token: null,
		profile: null, // { id, name, email }
		role: 'guest' // 'guest' | 'customer' | 'admin'
	}),
	getters: {
		isAuthenticated: (state) => Boolean(state.token)
	},
	actions: {
		login({ token, profile, role = 'customer' }) {
			this.token = token;
			this.profile = profile;
			this.role = role;
		},
		logout() {
			this.token = null;
			this.profile = null;
			this.role = 'guest';

			// Clear other stores (use safe guards in case methods are renamed)
			const wishlistStore = useWishlistStore();
			const cartStore = useCartStore();
			if (typeof wishlistStore.clear === 'function') wishlistStore.clear();
			if (typeof cartStore.clearCart === 'function') cartStore.clearCart();
		},
		updateProfile(patch) {
			this.profile = { ...(this.profile ?? {}), ...patch };
		},
		setRole(role) {
			this.role = role;
		}
	},
	persist: {
		paths: ['token', 'profile', 'role']
	}
});


