<template>
	<div class="relative">
		<label v-if="label" class="mb-1 block text-sm font-medium">{{ label }}</label>
		<button
			@click="isOpen = !isOpen"
			type="button"
			class="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-900"
		>
			<span class="block truncate">{{ selectedLabel }}</span>
			<span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
				<svg class="h-5 w-5 text-gray-400 transition-transform" :class="{ 'rotate-180': isOpen }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
				</svg>
			</span>
		</button>

		<!-- Backdrop to close dropdown on outside click -->
		<div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 z-5"></div>

		<transition
			leave-active-class="transition ease-in duration-100"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<ul v-if="isOpen" class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
				<li
					v-for="option in options"
					:key="option.value"
					@click="selectOption(option)"
					class="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
				>
					<span class="block truncate" :class="{ 'font-semibold': isSelected(option) }">{{ option.label }}</span>
					<span v-if="isSelected(option)" class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-900 dark:text-gray-100">
						<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clip-rule="evenodd" />
						</svg>
					</span>
				</li>
			</ul>
		</transition>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
	modelValue: [String, Number],
	label: String,
	options: {
		type: Array,
		default: () => []
	},
	placeholder: {
		type: String,
		default: 'Select an option'
	}
});

const emit = defineEmits(['update:modelValue']);
const isOpen = ref(false);

const selectedLabel = computed(() => {
	const selected = props.options.find(o => o.value === props.modelValue);
	return selected ? selected.label : props.placeholder;
});

const isSelected = (option) => {
	return props.modelValue === option.value;
};

function selectOption(option) {
	emit('update:modelValue', option.value);
	isOpen.value = false;
}
</script>


