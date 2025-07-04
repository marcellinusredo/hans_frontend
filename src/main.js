import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'vue-toastification/dist/index.css'

import './assets/pagination.css'
import './assets/modal-button.css'

import Toast from 'vue-toastification'

// Import semua komponen dan plugin dari bootstrap-vue-next
import * as BootstrapVueNext from 'bootstrap-vue-next'

import useLoading from '@/composables/useLoading'

const { startLoading, stopLoading } = useLoading()

const app = createApp(App)

for (const [key, item] of Object.entries(BootstrapVueNext)) {
  if (key === 'default') continue
  // Cek apakah item punya method install() → kemungkinan plugin
  if (item && typeof item.install === 'function') {
    app.use(item) // daftar plugin
  } else {
    app.component(key, item) // daftar komponen
  }
}

app.use(Toast, {
  // Posisi notifikasi (boleh ubah sesuai kebutuhan)
  position: 'top-right',

  // ✅ Biar notifikasi terbaru muncul di bawah
  newestOnTop: false,

  // Lama tampil toast (dalam milidetik)
  timeout: 3000,

  // Maksimal jumlah toast yang tampil bersamaan
  maxToasts: 5,

  // Bisa ditutup dengan klik
  closeOnClick: true,

  // Pause saat hover
  pauseOnHover: true,

  // Toast bisa digeser
  draggable: true,
})

app.use(router)

axios.defaults.baseURL = 'http://localhost:8000/api'
app.config.globalProperties.$axios = axios

// Tambahkan token jika ada
axios.interceptors.request.use((config) => {
  startLoading()
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axios.interceptors.response.use(
  (response) => {
    stopLoading()
    return response
  },
  (error) => {
    stopLoading()
    // Cek apakah error dari backend karena tidak otentikasi
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('token') // Hapus token
      router.push('/login') // Redirect ke halaman login
    }
    return Promise.reject(error)
  },
)

app.mount('#app')
