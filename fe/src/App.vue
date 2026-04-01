<template>
	<div :class="[{ dark: isDark }]">
		<AdminLayout v-if="user.role === 'admin'">
		<RouterView />
		</AdminLayout>

		<StaffLayout v-else-if="user.role === 'staff'">
		<RouterView />
		</StaffLayout>

		<DefaultLayout v-else>
		<RouterView />
		</DefaultLayout>
		<Toast />
		<CompareFloatingBox />
	</div>
	<!-- Dark mode class applied to html element for Tailwind -->
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useUIStore } from './stores/ui';
import { useUserStore } from './stores/user';
import { RouterView } from 'vue-router';
import DefaultLayout from './components/layout/DefaultLayout.vue';
import AdminLayout from './components/layout/AdminLayout.vue';
import StaffLayout from './components/layout/StaffLayout.vue';
import Toast from './components/common/Toast.vue';
import CompareFloatingBox from './pages/customer/CompareFloatingBox.vue';

const ui = useUIStore();
const user = useUserStore();
const isDark = computed(() => ui.isDarkMode);

onMounted(() => {
	ui.initTheme();
});
</script>


