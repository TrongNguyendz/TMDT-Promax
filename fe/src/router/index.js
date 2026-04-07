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
const TotalAmountSpent = () => import('../pages/customer/TotalAmount.vue');
const SupportPage = () => import('../pages/customer/support.vue');
const CompareProductPage = () => import('../pages/customer/CompareProductPage.vue');

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
const TryOnClothesWithAI = () => import('../pages/customer/TryOnClothesWithAIPage.vue');
const StaffManagement = () => import('../pages/admin/StaffManagement.vue');
const ReviewManagement = () => import('../pages/admin/ReviewManagement.vue');
const AdminInvoiceManagementv2 = () => import('../pages/admin/AdminInvoiceManagement-v2.vue');
const AdminSupport = () => import('../pages/admin/SupportManagement.vue');
const AdminProfile = () => import('../pages/admin/Profile.vue');
// Staff pages (can be added similarly to admin pages if needed)
// const StaffWelcome = () => import('../pages/Staff/StaffWelcome.vue');
const StaffDashboard = () => import('../pages/Staff/DashBoard.vue');
const StaffOrders = () => import('../pages/Staff/Orders.vue');
// const StaffEvents = () => import('../pages/Staff/Events.vue');
const StaffSupport = () => import('../pages/Staff/Support.vue');
const StaffProfile = () => import('../pages/Staff/Profile.vue');
const StaffPacking = () => import('../pages/Staff/Packing.vue');
const StaffWelcome = () => import('../pages/Staff/Welcome.vue');
const StaffIventory = () => import('../pages/Staff/Inventory.vue');
const StaffSchedule = () => import('../pages/Staff/Schedule.vue')
const StaffComment = () => import('../pages/Staff/comment.vue');

const routes = [
	{ path: '/', component: HomePage },
	{ path: '/products', component: ProductList },
	{ path: '/compare', component: CompareProductPage },
	{ path: '/product/:id', component: ProductDetail },
	{ path: '/cart', component: CartPage, meta: { requiresAuth: true } },
	{ path: '/checkout', component: CheckoutPage, meta: { requiresAuth: true } },
	{ path: '/auth', component: AuthPage, meta: { publicOnly: true } },
	{ path: '/wishlist', component: WishlistPage, meta: { requiresAuth: true } },
	{ path: '/search', component: SearchResults },
	{ path: '/about', component: AboutPage },
	{ path: '/contact', component: ContactPage },
	{ path: '/policy', component: PolicyPage },
	{ path: '/try-on/:id', component: TryOnClothesWithAI },
	{ path: '/total-amount', component: TotalAmountSpent },
	{ path: '/support', component: SupportPage },

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
	{ path: '/admin/orders-detail/:id', component: AdminOrderDetail, meta: { requiresAdmin: true } },
	{ path: '/admin/staff', component: StaffManagement, meta: { requiresAdmin: true } },
    { path: '/admin/reviews', component: ReviewManagement, meta: { requiresAdmin: true } },
    { path: '/admin/invoicesv2', component: AdminInvoiceManagementv2, meta: { requiresAdmin: true } },
    { path: '/admin/support', component: AdminSupport, meta: { requiresAdmin: true } },
	{ path: '/admin/profile', component: AdminProfile, meta: { requiresAdmin: true } },
     

	// Staff routes (can be added similarly to admin routes if needed)
	{ path: '/staff/welcome', component: StaffWelcome, meta: { requiresStaff: true } },
	{ path: '/staff/dashboard', component: StaffDashboard, meta: { requiresStaff: true } },
	{ path: '/staff/orders', component: StaffOrders, meta: { requiresStaff: true } },
	// { path: '/staff/events', component: StaffEvents, meta: { requiresStaff: true } },
	{ path: '/staff/support', component: StaffSupport, meta: { requiresStaff: true } },
	{ path: '/staff/profile', component: StaffProfile, meta: { requiresStaff: true } },
	{ path: '/staff/packing', component: StaffPacking, meta: { requiresStaff: true } },
	{ path: '/staff/inventory', component: StaffIventory, meta: { requiresStaff: true } } ,
	{ path: '/staff/schedule', component: StaffSchedule, meta: { requiresStaff: true } },
    { path: '/staff/comments', component: StaffComment, meta: { requiresStaff: true } }
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


router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    const isAuth = userStore.token && userStore.token !== 'null' && userStore.token !== 'undefined';
    const role = userStore.profile?.role || 'guest';

    // 1. Chặn người dùng chưa đăng nhập vào trang cá nhân
    if (to.meta?.requiresAuth && !isAuth) {
        return next({ path: '/auth', query: { redirect: to.fullPath } });
    }

    // 2. Chặn người dùng đã đăng nhập vào lại trang Login/Register
    if (to.meta?.publicOnly && isAuth) {
        return next({ path: '/' });
    }

    // 3. Chặn người dùng thường vào trang Admin
    if (to.meta?.requiresAdmin && (!isAuth || role !== 'admin')) {
        return next({ path: '/' });
    }

    next();
});

export default router;


