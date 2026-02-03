<template>
	<section class="mx-auto max-w-2xl">
		<h1 class="mb-4 text-xl font-semibold">Liên hệ</h1>
		<form class="space-y-3">
			<InputField v-model="form.name" label="Họ tên" />
			<InputField v-model="form.email" label="Email" type="email" />
			<label class="block text-sm">
				<span class="mb-1 block font-medium">Nội dung</span>
				<textarea v-model="form.message" rows="4" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"></textarea>
			</label>
			<button type="button" class="rounded bg-gray-900 px-3 py-2 text-white dark:bg-gray-100 dark:text-black" @click="send">Gửi</button>
		</form>
	</section>
</template>

<script setup>
import { reactive } from 'vue';
import InputField from '../components/forms/InputField.vue';
import { useUIStore } from '../stores/ui';
const ui = useUIStore();
const form = reactive({ name: '', email: '', message: '' });
function send() {
	ui.pushToast({ type: 'success', message: 'Đã gửi liên hệ (demo)' });
}
</script>


