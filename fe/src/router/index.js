import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

// Core pages (lazy loaded)
const HomePage = () => import('../pages/customer/HomePage.vue');
const ProductList = () => import('../pages/customer/ProductList.vue');
const ProductDetail = () => import('../pages/customer/ProductDetail.vue');
const CartPage = () => import('../pages/customer/CartPage.vue');
const CheckoutPage = () => import('../pages/customer/CheckoutPage.vue');
const AuthPage = () => import('../pages/customer/AuthPage.vue');
const WishlistPage = () => import('../pages/customer/WishlistPage.vue');
const SearchResults = () => import('../pages/customer/SearchResults.vue');
const AboutPage = () => import('../pages/customer/AboutPage.vue');
const ContactPage = () => import('../pages/customer/ContactPage.vue');
const PolicyPage = () => import('../pages/customer/PolicyPage.vue');

// User pages
const ProfilePage = () => import('../pages/customer/ProfilePage.vue');
const OrderHistory = () => import('../pages/customer/OrderHistory.vue');
const OrderDetail = () => import('../pages/customer/OrderDetail.vue');
const OrderTracking = () => import('../pages/customer/OrderTracking.vue');
const Invoice = () => import('../pages/customer/Invoice.vue');

// Admin pages
const AdminWelcome = () => import('../pages/admin/AdminWelcome.vue');
const AdminDashboard = () => import('../pages/admin/AdminDashboard.vue');
const ProductManagement = () => import('../pages/admin/ProductManagement.vue');
const OrderManagement = () => import('../pages/admin/OrderManagement.vue');
const UserManagement = () => import('../pages/admin/UserManagement.vue');
const BannerManagement = () => import('../pages/admin/BannerManagement.vue');
const ReportPage = () => import('../pages/admin/ReportPage.vue');
const AdminInvoiceManagement = () => import('../pages/admin/AdminInvoiceManagement.vue');
const VoucherManagement = () => import('../pages/admin/VoucherManagement.vue');
const TransportManagement = () => import('../pages/admin/TransportPage.vue');
const TryOnClothesWithAI = () => import('../pages/customer/TryOnClothesWithAIPage.vue');

const routes = [
	{ path: '/', component: HomePage },
	{ path: '/products', component: ProductList },
	{ path: '/product/:id', component: ProductDetail },
	{ path: '/cart', component: CartPage },
	{ path: '/checkout', component: CheckoutPage },
	{ path: '/auth', component: AuthPage, meta: { publicOnly: true } },
	{ path: '/wishlist', component: WishlistPage },
	{ path: '/search', component: SearchResults },
	{ path: '/about', component: AboutPage },
	{ path: '/contact', component: ContactPage },
	{ path: '/policy', component: PolicyPage },
	{ path: '/try-on/:id', component: TryOnClothesWithAI },

	{ path: '/profile', component: ProfilePage, meta: { requiresAuth: true } },
	{ path: '/orders', component: OrderHistory, meta: { requiresAuth: true } },
	{ path: '/orders/:id', component: OrderDetail, meta: { requiresAuth: true } },
	{ path: '/tracking/:orderId', component: OrderTracking, meta: { requiresAuth: true } },
	{ path: '/invoice/:id', component: Invoice, meta: { requiresAuth: true } },

	{ path: '/admin/welcome', component: AdminWelcome, meta: { requiresAdmin: true } },
	{ path: '/admin', component: AdminDashboard, meta: { requiresAdmin: true } },
	{ path: '/admin/products', component: ProductManagement, meta: { requiresAdmin: true } },
	{ path: '/admin/orders', component: OrderManagement, meta: { requiresAdmin: true } },
	{ path: '/admin/users', component: UserManagement, meta: { requiresAdmin: true } },
	{ path: '/admin/banners', component: BannerManagement, meta: { requiresAdmin: true } },
	{ path: '/admin/reports', component: ReportPage, meta: { requiresAdmin: true } },
	{ path: '/admin/vouchers', component: VoucherManagement, meta: { requiresAdmin: true } },
	{ path: '/admin/invoices', component: AdminInvoiceManagement, meta: { requiresAdmin: true } },
	{ path: '/admin/transport', component: TransportManagement, meta: { requiresAdmin: true } }
];

// Add catch-all route for 404
const routes404 = [
	...routes,
	{ path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
	history: createWebHistory(),
	routes: routes404,
	scrollBehavior() {
		return { top: 0 };
	}
});

router.beforeEach((to) => {
	const user = useUserStore();
	if (to.meta?.requiresAuth && !user.isAuthenticated) {
		return { path: '/auth', query: { redirect: to.fullPath } };
	}
	if (to.meta?.publicOnly && user.isAuthenticated) {
		return { path: '/' };
	}
	if (to.meta?.requiresAdmin && (!user.isAuthenticated || user.role !== 'admin')) {
		return { path: '/' };
	}
	return true;
});

export default router;


