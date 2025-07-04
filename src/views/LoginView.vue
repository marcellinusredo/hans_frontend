<template>
  <div class="d-flex flex-column justify-content-center align-items-center vh-100 bg-white px-3">
    <h1 class="mb-4 text-center text-md-start">Han's Motor Speed 2</h1>

    <b-card class="p-4 px-md-5 w-100 shadow-sm text-center" style="max-width: 400px">
      <h4 class="mb-2">LOGIN</h4>
      <p class="mb-4 text-muted">Masukkan username dan password</p>

      <b-form @submit.prevent="login" class="text-start">
        <b-form-group label="Username" label-for="username">
          <b-form-input id="username" placeholder="Masukkan username" v-model="username" required />
        </b-form-group>

        <b-form-group label="Password" label-for="password">
          <b-form-input
            id="password"
            type="password"
            placeholder="Masukkan password"
            v-model="password"
            required
          />
        </b-form-group>

        <b-button type="submit" variant="primary" class="w-100 mt-3">Login</b-button>
      </b-form>
    </b-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { toastLoginRes, toastErr } from '@/helpers/toast'

const username = ref('')
const password = ref('')
const router = useRouter()

const login = async () => {
  try {
    const response = await axios.post('/login', {
      username_staff: username.value,
      password_staff: password.value,
    })

    // Simpan token di sessionStorage (bukan localStorage)
    sessionStorage.setItem('token', response.data.token)
    sessionStorage.setItem('id_staff', response.data.user.id_staff)
    sessionStorage.setItem('nama_role', response.data.user.role.nama_role)

    // Set default Authorization header axios
    const res = (axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`)

    toastLoginRes(res)
    router.push('/dashboard')
  } catch (err) {
    toastErr(err)
  }
}
</script>
