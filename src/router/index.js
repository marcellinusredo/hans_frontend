// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import StaffView from '@/views/StaffView.vue'
import SupplierView from '@/views/SupplierView.vue'
import PelangganView from '@/views/PelangganView.vue'
import KategoriView from '@/views/KategoriView.vue'
import JasaView from '@/views/JasaView.vue'
import ProdukView from '@/views/ProdukView.vue'
import PengadaanStokView from '@/views/PengadaanStokView.vue'
import TransaksiView from '@/views/TransaksiView.vue'
import LaporanView from '@/views/LaporanView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/staff',
    name: 'staff',
    component: StaffView,
    meta: {
      requiresAuth: true,
      allowedRoles: ['Super Admin', 'Pemilik'],
    },
  },
  {
    path: '/supplier',
    name: 'supplier',
    component: SupplierView,
    meta: {
      requiresAuth: true,
      allowedRoles: ['Super Admin', 'Admin'],
    },
  },
  {
    path: '/pelanggan',
    name: 'pelanggan',
    component: PelangganView,
    meta: { requiresAuth: true, allowedRoles: ['Super Admin', 'Kasir'] },
  },
  {
    path: '/kategori',
    name: 'kategori',
    component: KategoriView,
    meta: { requiresAuth: true, allowedRoles: ['Super Admin', 'Admin'] },
  },
  {
    path: '/jasa',
    name: 'jasa',
    component: JasaView,
    meta: { requiresAuth: true, allowedRoles: ['Super Admin', 'Admin', 'Kasir'] },
  },
  {
    path: '/produk',
    name: 'produk',
    component: ProdukView,
    meta: { requiresAuth: true, allowedRoles: ['Super Admin', 'Admin', 'Kasir'] },
  },
  {
    path: '/pengadaanstok',
    name: 'pengadaanstok',
    component: PengadaanStokView,
    meta: {
      requiresAuth: true,
      allowedRoles: ['Super Admin', 'Admin'],
    },
  },
  {
    path: '/transaksi',
    name: 'transaksi',
    component: TransaksiView,
    meta: {
      requiresAuth: true,
      allowedRoles: ['Super Admin', 'Kasir'],
    },
  },
  {
    path: '/laporan',
    name: 'laporan',
    component: LaporanView,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ✅ Navigation guard global untuk autentikasi & role checking
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!sessionStorage.getItem('token')
  const userRole = sessionStorage.getItem('nama_role')

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Jika belum login tapi akses halaman yang butuh login
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    // Jika sudah login tapi akses login
    next('/dashboard')
  } else if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(userRole)) {
    // Jika login tapi role tidak diizinkan
    next('/dashboard') // bisa diarahkan ke 403 page juga
  } else {
    next()
  }
})

export default router
