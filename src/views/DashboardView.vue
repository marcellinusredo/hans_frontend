<template>
  <div class="container mt-4">
    <h2 class="fw-bold mb-4">Dashboard</h2>
    <div class="bg-white p-5 shadow rounded mt-4">
      <!-- Judul Ringkasan Bulan -->
      <h4 class="fw-bold text-center mb-4">Ringkasan {{ bulanTahunSekarang }}</h4>

      <!-- Top Cards -->
      <b-row class="g-3 mb-4">
        <b-col v-for="card in topCards" :key="card.key" :md="colSizeTop">
          <b-card :class="`border-${card.variant} bg-${card.variant} bg-opacity-10 shadow-sm`">
            <template #header>
              <span :class="`fw-semibold text-${card.variant}`">{{ card.title }}</span>
            </template>
            <div class="fs-5">
              <FormatRupiah v-if="card.isRupiah" :value="card.value" />
              <span v-else>{{ card.value }}</span>
            </div>
          </b-card>
        </b-col>
      </b-row>

      <!-- Transaksi & Pengadaan Terbaru -->
      <b-row class="mb-4">
        <b-col v-for="card in middleCards" :key="card.key" :md="middleCards.length === 2 ? 6 : 12">
          <b-card class="border-primary shadow-sm">
            <template #header>
              <span class="fw-semibold text-primary">{{ card.title }}</span>
            </template>
            <ul class="list-unstyled mb-0">
              <li v-for="item in card.items" :key="item.key" class="mb-2" v-html="item.html" />
            </ul>
          </b-card>
        </b-col>
      </b-row>

      <!-- Produk & Jasa Terlaris -->
      <b-row class="mb-4">
        <b-col v-for="card in larisCards" :key="card.key" :md="larisCards.length === 2 ? 6 : 12">
          <b-card class="border-primary shadow-sm">
            <template #header>
              <span class="fw-semibold text-primary">{{ card.title }}</span>
            </template>
            <ul class="list-unstyled mb-0">
              <li v-for="item in card.items" :key="item.key" class="mb-2" v-html="item.html" />
            </ul>
          </b-card>
        </b-col>
      </b-row>

      <!-- Produk Hampir Habis -->
      <b-row class="mb-4" v-if="['Super Admin', 'Admin'].includes(nama_role)">
        <b-col md="12">
          <b-card class="border-danger bg-danger bg-opacity-10 shadow-sm">
            <template #header>
              <span class="fw-semibold text-danger">Produk Hampir Habis</span>
            </template>
            <p class="mb-2">
              <strong>Total:</strong> {{ dataDashboard.jumlah_produk_hampir_habis }} produk
            </p>
            <ul class="mb-0 ps-3">
              <li
                v-for="produk in dataDashboard.produk_hampir_habis.slice(0, 5)"
                :key="produk.id_produk"
              >
                {{ produk.nama_produk }} –
                <span :class="{ 'text-danger fw-bold': produk.stok_produk === 0 }">
                  Stok: {{ produk.stok_produk }}
                </span>
              </li>
            </ul>
          </b-card>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, computed } from 'vue'
import axios from 'axios'
import FormatRupiah from '@/components/FormatRupiah.vue'
import { toastErr } from '@/helpers/toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const nama_role = sessionStorage.getItem('nama_role')

// Format tanggal lokal bulan dan tahun sekarang
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
const bulanTahunSekarang = capitalize(format(new Date(), 'MMMM yyyy', { locale: id }))

const dataDashboard = reactive({
  pendapatan_bulan_ini: 0,
  pengeluaran_pengadaan_bulan_ini: 0,
  jumlah_transaksi_bulan_ini: 0,
  jumlah_pengadaan_bulan_ini: 0,
  jumlah_produk_hampir_habis: 0,
  produk_hampir_habis: [],
  transaksi_terbaru: [],
  jasa_terlaris: [],
  produk_terlaris: [],
  pengadaan_terbaru: [],
})

const topCards = computed(() => {
  const cards = []
  if (['Super Admin', 'Kasir', 'Pemilik'].includes(nama_role)) {
    cards.push({
      key: 'pendapatan',
      title: 'Pendapatan Transaksi',
      variant: 'success',
      value: dataDashboard.pendapatan_bulan_ini || 0,
      isRupiah: true,
    })
  }
  if (['Super Admin', 'Admin', 'Pemilik'].includes(nama_role)) {
    cards.push({
      key: 'pengeluaran',
      title: 'Pengeluaran Pengadaan Stok',
      variant: 'warning',
      value: dataDashboard.pengeluaran_pengadaan_bulan_ini || 0,
      isRupiah: true,
    })
  }
  if (['Super Admin', 'Kasir', 'Pemilik'].includes(nama_role)) {
    cards.push({
      key: 'transaksi',
      title: 'Jumlah Transaksi',
      variant: 'info',
      value: dataDashboard.jumlah_transaksi_bulan_ini || 0,
      isRupiah: false,
    })
  }
  if (['Super Admin', 'Admin', 'Pemilik'].includes(nama_role)) {
    cards.push({
      key: 'pengadaan',
      title: 'Jumlah Pengadaan Stok',
      variant: 'info',
      value: dataDashboard.jumlah_pengadaan_bulan_ini || 0,
      isRupiah: false,
    })
  }
  return cards
})

const colSizeTop = computed(() => Math.floor(12 / (topCards.value.length || 1)))

const middleCards = computed(() => {
  const cards = []
  if (['Super Admin', 'Kasir'].includes(nama_role)) {
    cards.push({
      key: 'transaksi-terbaru',
      title: 'Transaksi Terbaru',
      items: dataDashboard.transaksi_terbaru.map((t) => ({
        key: t.id_transaksi,
        html: `<strong>${t.waktu_transaksi || '-'}</strong> · ${t.pelanggan?.nama_pelanggan || 'Umum'} · Rp ${Number(t.total_harga_transaksi || 0).toLocaleString('id-ID')}`,
      })),
    })
  }
  if (['Super Admin', 'Admin'].includes(nama_role)) {
    cards.push({
      key: 'pengadaan-terbaru',
      title: 'Pengadaan Stok Terbaru',
      items: dataDashboard.pengadaan_terbaru.map((p) => ({
        key: p.id_pengadaan_stok,
        html: `<strong>${p.waktu_pengadaan_stok || '-'}</strong> · ${p.supplier?.nama_supplier || 'Tanpa Supplier'} · Rp ${Number(p.total_harga_pengadaan_stok || 0).toLocaleString('id-ID')}`,
      })),
    })
  }
  return cards
})

const larisCards = computed(() => {
  const cards = []
  if (['Super Admin', 'Admin', 'Kasir', 'Pemilik'].includes(nama_role)) {
    cards.push({
      key: 'produk-terlaris',
      title: 'Produk Terlaris',
      items: dataDashboard.produk_terlaris.map((p) => ({
        key: p.nama_produk,
        html: `${p.nama_produk} - ${p.total} terjual`,
      })),
    })
    cards.push({
      key: 'jasa-terlaris',
      title: 'Jasa Terlaris',
      items: dataDashboard.jasa_terlaris.map((j) => ({
        key: j.nama_jasa,
        html: `${j.nama_jasa} - ${j.total} kali`,
      })),
    })
  }
  return cards
})

async function fetchDashboard() {
  const token = sessionStorage.getItem('token')
  try {
    const res = await axios.get('/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = res.data
    dataDashboard.pendapatan_bulan_ini = Number(data.pendapatan_bulan_ini) || 0
    dataDashboard.pengeluaran_pengadaan_bulan_ini =
      Number(data.pengeluaran_pengadaan_bulan_ini) || 0
    dataDashboard.jumlah_transaksi_bulan_ini = Number(data.jumlah_transaksi_bulan_ini) || 0
    dataDashboard.jumlah_pengadaan_bulan_ini = Number(data.jumlah_pengadaan_bulan_ini) || 0
    dataDashboard.jumlah_produk_hampir_habis = Number(data.jumlah_produk_hampir_habis) || 0
    dataDashboard.produk_hampir_habis = data.produk_hampir_habis || []
    dataDashboard.jasa_terlaris = data.jasa_terlaris || []
    dataDashboard.produk_terlaris = data.produk_terlaris || []
    dataDashboard.transaksi_terbaru = (data.transaksi_terbaru || []).map((t) => ({
      ...t,
      total_harga_transaksi: Number(t.total_harga_transaksi) || 0,
    }))
    dataDashboard.pengadaan_terbaru = (data.pengadaan_terbaru || []).map((p) => ({
      ...p,
      total_harga_pengadaan_stok: Number(p.total_harga_pengadaan_stok) || 0,
    }))
  } catch (error) {
    toastErr(error)
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>
