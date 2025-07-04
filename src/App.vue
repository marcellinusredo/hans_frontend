<template>
  <div>
    <!-- Sidebar dan Topbar hanya tampil jika bukan halaman login -->
    <SidebarView v-if="showLayout" :collapsed="collapsed" />

    <div
      :style="{
        marginLeft: showLayout && !collapsed ? '200px' : '0px',
        transition: 'margin-left 0.3s',
      }"
    >
      <TopbarView v-if="showLayout" @toggleSidebar="collapsed = !collapsed" />
      <div class="p-4">
        <router-view />
        <GlobalSpinner />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarView from './components/SidebarComponents.vue'
import TopbarView from './components/TopbarComponents.vue'
import GlobalSpinner from '@/components/GlobalSpinner.vue'

const collapsed = ref(false)
const route = useRoute()

// Jika route name adalah 'login', maka layout sidebar dan topbar disembunyikan
const showLayout = computed(() => route.name !== 'login')
</script>
