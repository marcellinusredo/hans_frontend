<template>
  <div v-if="isLoading" class="spinner-overlay">
    <b-spinner label="Loading..." variant="primary" />
  </div>
</template>

<script setup>
import useLoading from '@/composables/useLoading'
const { isLoading } = useLoading()
</script>

<style scoped>
.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
</style>
