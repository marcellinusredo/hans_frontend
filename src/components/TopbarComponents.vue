<template>
  <nav
    class="navbar navbar-dark w-100 d-flex align-items-center justify-content-between"
    style="height: 56px; background-color: #1e3a8a; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1)"
  >
    <!-- Tombol toggle sidebar -->
    <div class="d-flex align-items-center">
      <button class="btn btn-outline-light ms-3" @click="$emit('toggleSidebar')">☰</button>
    </div>

    <!-- Judul di tengah -->
    <span class="navbar-brand mb-0 h1 text-center flex-grow-1">Han's Motor Speed 2</span>

    <!-- Role user login di kanan -->
    <div class="text-light me-3 d-none d-sm-block">
      <small
        >Role: <strong>{{ role }}</strong></small
      >
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const role = ref('')

onMounted(() => {
  // Ambil role langsung dari sessionStorage
  role.value = sessionStorage.getItem('nama_role') || 'Tidak diketahui'
})
</script>
