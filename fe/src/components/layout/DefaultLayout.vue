<template>
	<div class="flex flex-col min-h-screen">
		<Header />
		<main class="mx-auto max-w-7xl px-4 py-6 flex-1">
			<slot />
		</main>
		<Footer />
		<AboutModal v-if="uiStore.isAboutModalOpen" @close="uiStore.closeAboutModal" />
		<MembershipModal v-if="uiStore.isMembershipModalOpen" @close="uiStore.closeMembershipModal" />
	</div>
</template>

<script setup>
import Header from '../common/Header.vue';
import Footer from '../common/Footer.vue';
import AboutModal from '../common/AboutModal.vue';
import { useUIStore } from '../../stores/ui';
import MembershipModal from '../common/MembershipModal.vue'
const uiStore = useUIStore();
</script>


