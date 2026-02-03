<template>
	<label class="block text-sm">
		<span v-if="label" class="mb-1 block font-medium">{{ label }}</span>
		<input
			v-bind="$attrs"
			:type="type"
			:placeholder="placeholder"
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
			:value="modelValue"
			@input="$emit('update:modelValue', $event.target.value)"
		/>
		<span v-if="message" class="mt-1 block text-xs text-red-600">{{ message }}</span>
	</label>
	</template>
	
	<script setup>
	defineProps({
		modelValue: [String, Number],
		label: String,
		placeholder: String,
		type: {
			type: String,
			default: 'text'
		},
		message: String
	});
	defineEmits(['update:modelValue']);
	</script>
	

