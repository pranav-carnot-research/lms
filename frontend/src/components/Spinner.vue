<template>
	<span
		class="inline-block rounded-full border-2 border-current border-t-transparent animate-spin"
		:class="sizeClass"
		role="status"
		aria-label="Loading"
	/>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
	size: {
		type: String,
		default: 'sm',
		validator: (v) => ['xs', 'sm', 'md', 'lg'].includes(v),
	},
})

const sizeClass = computed(() => ({
	xs: 'size-3',
	sm: 'size-4',
	md: 'size-6',
	lg: 'size-8',
}[props.size]))
</script>
