<!-- components/FormatRupiah.vue -->
<template>
  <span>{{ formatted }}</span>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  value: {
    type: [Number, String],
    required: true,
  },
})

const formatted = computed(() =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(props.value),
)
</script>
