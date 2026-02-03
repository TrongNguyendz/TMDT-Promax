import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

// Core pages (lazy loaded)
const HomePage = () => import('../pages/HomePage.vue');
const ProductList = () => import('../pages/ProductList.vue');
const ProductDetail = () => import('../pages/ProductDetail.vue');
const CartPage = () => import('../pages/CartPage.vue');
const CheckoutPage = () => import('../pages/CheckoutPage.vue');
const AuthPage = () => import('../pages/AuthPage.vue');
const WishlistPage = () => import('../pages/WishlistPage.vue');
const SearchResults = () => import('../pages/SearchResults.vue');
const AboutPage = () => import('../pages/AboutPage.vue');
const ContactPage = () => import('../pages/ContactPage.vue');
const PolicyPage = () => import('../pages/PolicyPage.vue');

// User pages
const ProfilePage = () => import('../pages/ProfilePage.vue');
const OrderHistory = () => import('../pages/OrderHistory.vue');
const OrderDetail = () => import('../pages/OrderDetail.vue');
const OrderTracking = () => import('../pages/OrderTracking.vue');
const Invoice = () => import('../pages/Invoice.vue');

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
	{ path: '/admin/invoices', component: AdminInvoiceManagement, meta: { requiresAdmin: true } }
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


