<template>
  <!-- Sidebar utama -->
  <div
    class="border-end vh-100 position-fixed top-0 start-0 d-flex flex-column overflow-hidden"
    :style="{
      backgroundColor: '#F9FAFB',
      width: collapsed ? '0px' : '200px',
      transition: 'width 0.3s',
      whiteSpace: 'nowrap',
      boxShadow: '2px 0 6px rgba(0, 0, 0, 0.04)',
    }"
  >
    <!-- Logo di bagian atas sidebar -->
    <div v-show="!collapsed" class="text-center py-3">
      <img
        src="/logo.png"
        alt="Logo Bengkel"
        style="height: 48px; max-width: 85%; object-fit: contain; margin-bottom: 12px"
      />
      <div
        style="
          height: 1px;
          width: 80%;
          margin: 0 auto;
          background: linear-gradient(to right, transparent, #d1d5db, transparent);
        "
      ></div>
    </div>

    <!-- Konten Sidebar -->
    <div class="d-flex flex-column justify-content-between" style="height: calc(100% - 56px)">
      <!-- Menu -->
      <div v-show="!collapsed" class="p-3 overflow-auto">
        <router-link
          to="/dashboard"
          v-if="['Super Admin', 'Admin', 'Kasir', 'Pemilik'].includes(nama_role)"
          class="sidebar-link d-block mb-2"
          active-class="active-link"
        >
          <i class="bi bi-house-door-fill me-2"></i> Dashboard
        </router-link>
        <router-link
          to="/staff"
          v-if="['Super Admin', 'Pemilik'].includes(nama_role)"
          class="sidebar-link d-block mb-2"
          active-class="active-link"
        >
          <i class="bi bi-people-fill me-2"></i> Staff
        </router-link>
        <router-link
          to="/supplier"
          v-if="['Super Admin', 'Admin'].includes(nama_role)"
          class="sidebar-link d-block mb-2"
          active-class="active-link"
        >
          <i class="bi bi-truck me-2"></i> Supplier
        </router-link>
        <router-link
          to="/pelanggan"
          v-if="['Super Admin', 'Kasir'].includes(nama_role)"
          class="sidebar-link d-block mb-2"
          active-class="active-link"
        >
          <i class="bi bi-person-fill me-2"></i> Pelanggan
        </router-link>
        <router-link
          to="/kategori"
          v-if="['Super Admin', 'Admin'].includes(nama_role)"
          class="sidebar-link d-block mb-2"
          active-class="active-link"
        >
          <i class="bi bi-tags-fill me-2"></i> Kategori
        </router-link>
        <router-link
          to="/jasa"
          v-if="['Super Admin', 'Admin', 'Kasir'].includes(nama_role)"
          class="sidebar-link d-block mb-2"
          active-class="active-link"
        >
          <i class="bi bi-gear-fill me-2"></i> Jasa
        </router-link>
        <router-link
          to="/produk"
          v-if="['Super Admin', 'Admin', 'Kasir'].includes(nama_role)"
          class="sidebar-link d-block mb-2"
          active-class="active-link"
        >
          <i class="bi bi-box-seam me-2"></i> Produk
        </router-link>
        <router-link
          to="/pengadaanstok"
          v-if="['Super Admin', 'Admin'].includes(nama_role)"
          class="sidebar-link d-block mb-2"
          active-class="active-link"
        >
          <i class="bi bi-stack me-2"></i> Pengadaan Stok
        </router-link>
        <router-link
          to="/transaksi"
          v-if="['Super Admin', 'Kasir'].includes(nama_role)"
          class="sidebar-link d-block mb-2"
          active-class="active-link"
        >
          <i class="bi bi-receipt me-2"></i> Transaksi
        </router-link>
        <router-link
          to="/laporan"
          v-if="['Super Admin', 'Admin', 'Kasir', 'Pemilik'].includes(nama_role)"
          class="sidebar-link d-block mb-2"
          active-class="active-link"
        >
          <i class="bi bi-file-text-fill me-2"></i> Laporan
        </router-link>
      </div>

      <!-- Tombol Logout -->
      <div class="p-3" v-show="!collapsed">
        <button
          class="w-100 d-flex align-items-center justify-content-center"
          style="
            background-color: #ef4444;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            font-weight: 500;
            transition: background-color 0.3s;
          "
          @click="handleLogout"
        >
          <i class="bi bi-box-arrow-right me-2"></i> Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

defineProps({
  collapsed: Boolean,
})

const nama_role = sessionStorage.getItem('nama_role')

const router = useRouter()
const toast = useToast()

function handleLogout() {
  const token = sessionStorage.getItem('token')

  if (!token) {
    router.push('/login')
    return
  }

  axios
    .post(
      '/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    .then((response) => {
      const message = response.data?.message || 'Logout berhasil'
      toast.success(message)

      sessionStorage.removeItem('token')
      sessionStorage.removeItem('id_staff')
      router.push('/login')
    })
    .catch((error) => {
      console.error('Logout gagal:', error)
      const message = error.response?.data?.message || 'Logout gagal, coba lagi'
      toast.error(message)
      sessionStorage.removeItem('token')
      router.push('/login')
    })
}
</script>

<style scoped>
.sidebar-link {
  color: #4b5563; /* abu tua */
  font-weight: normal;
  font-size: 16px;
  text-decoration: none;
  transition:
    color 0.3s,
    font-weight 0.3s,
    background-color 0.3s;
  padding: 4px 8px;
  border-radius: 6px;
  display: block;
}

.sidebar-link:hover {
  color: #1e3a8a;
  background-color: #e0e7ff;
}

.active-link {
  color: #1e3a8a !important;
  font-weight: bold;
  background-color: #e0e7ff;
}
</style>
