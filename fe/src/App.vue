<template>
	<div :class="[{ dark: isDark }]">
		<DefaultLayout v-if="user.role !== 'admin'">
			<RouterView />
		</DefaultLayout>
		<AdminLayout v-else>
			<RouterView />
		</AdminLayout>
		<Toast />
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
import Toast from './components/common/Toast.vue';

const ui = useUIStore();
const user = useUserStore();
const isDark = computed(() => ui.isDarkMode);

onMounted(() => {
	ui.initTheme();
});
</script>


