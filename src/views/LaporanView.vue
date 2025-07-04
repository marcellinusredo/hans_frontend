<template>
  <div class="container py-5">
    <h2 class="fw-bold mb-4">Data Laporan</h2>
    <div class="bg-white p-5 shadow rounded mt-4">
      <!-- Form filter laporan -->
      <b-card class="mb-3 w-100">
        <b-form @submit.prevent="ambilLaporan">
          <b-row>
            <!-- Jenis Laporan -->
            <b-col md="3">
              <b-form-group label="Jenis Laporan">
                <b-form-select v-model="jenisLaporan" :options="opsiSelect" required />
              </b-form-group>
            </b-col>

            <!-- Tanggal Mulai -->
            <b-col md="3">
              <b-form-group label="Tanggal Mulai">
                <b-form-input type="date" v-model="tanggalMulai" required />
              </b-form-group>
            </b-col>

            <!-- Tanggal Akhir -->
            <b-col md="3">
              <b-form-group label="Tanggal Akhir">
                <b-form-input type="date" v-model="tanggalAkhir" required />
              </b-form-group>
            </b-col>

            <!-- Tombol Aksi -->
            <b-col md="3" class="d-flex align-items-end gap-2">
              <b-button type="submit" title="Cari" variant="primary" class="fw-semibold">
                <i class="bi bi-search me-2"></i> Cari
              </b-button>

              <b-dropdown
                variant="success"
                text="Download"
                :disabled="!laporanSiapTampil || loading || jenisLaporan !== jenisLaporanAktif"
                toggle-class="fw-semibold d-flex align-items-center justify-content-center px-3"
                class="rounded d-flex align-items-end gap-2"
                style="height: 38px"
              >
                <b-dropdown-item @click="konfirmasiExport('pdf')">
                  <i class="bi bi-file-earmark-pdf-fill me-2"></i> Export PDF
                </b-dropdown-item>
                <b-dropdown-item @click="konfirmasiExport('excel')">
                  <i class="bi bi-file-earmark-excel-fill me-2"></i> Export Excel
                </b-dropdown-item>
              </b-dropdown>
            </b-col>
          </b-row>
        </b-form>
      </b-card>

      <!-- Ringkasan Laporan -->
      <div v-if="laporanSiapTampil && !loading">
        <template v-if="tipeLaporan === 'ringkasan' && laporan">
          <b-card title="Ringkasan Laporan">
            <ul>
              <li>
                <strong>Total Pendapatan:</strong> <FormatRupiah :value="laporan.pendapatan" />
              </li>
              <li>
                <strong>Total Pengeluaran:</strong> <FormatRupiah :value="laporan.pengeluaran" />
              </li>
              <li><strong>Laba Kotor:</strong> <FormatRupiah :value="laporan.laba_kotor" /></li>
            </ul>
          </b-card>
        </template>

        <!-- Tabel Laporan -->
        <template v-if="tipeLaporan === 'tabel'">
          <!-- Kontrol per halaman -->
          <div class="d-flex justify-content-between mb-2">
            <div class="d-flex align-items-center gap-2">
              <i
                class="bi bi-grid"
                title="Jumlah per halaman"
                style="font-size: 1.2rem; color: #4b5563"
              ></i>
              <b-form-select v-model="perPage" :options="perPageOptions" class="w-auto" size="sm" />
            </div>
          </div>

          <!-- Tabel utama -->
          <b-table
            :items="laporan.data"
            :fields="laporanFields"
            striped
            bordered
            hover
            small
            responsive
            thead-class="text-center"
          >
            <template #cell(no)="data">
              {{
                perPage === 'all' ? data.index + 1 : (halamanSaatIni - 1) * perPage + data.index + 1
              }}
            </template>
            <template #cell(total_harga_transaksi)="data">
              <FormatRupiah :value="data.item.total_harga_transaksi" />
            </template>
            <template #cell(total_terjual)="data"> {{ data.item.total_terjual }} pcs </template>
            <template #cell(jumlah_digunakan)="data">
              {{ data.item.jumlah_digunakan }} kali
            </template>
            <template #cell(total_harga_pengadaan_stok)="data">
              <FormatRupiah :value="data.item.total_harga_pengadaan_stok" />
            </template>
          </b-table>

          <!-- Pagination -->
          <div class="position-relative mt-2" v-if="perPage !== 'all'">
            <div class="position-absolute end-0 top-0">
              <strong>Total Data:</strong> {{ totalRows }}
            </div>
            <div class="text-center">
              <b-pagination
                v-model="halamanSaatIni"
                :total-rows="totalRows"
                :per-page="perPage"
                align="center"
                class="mt-2"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
    <b-modal
      id="modal-konfirmasi-download"
      ref="modalKonfirmasi"
      title="Konfirmasi Unduhan"
      ok-title="Download"
      cancel-title="Batal"
      centered
      title-class="fw-bold text-center w-100"
      footer-class="d-flex justify-content-between "
      @ok="() => exportLaporan(formatUnduhan)"
    >
      <p>
        Apakah Anda yakin ingin mengunduh laporan <strong>{{ jenisLaporanAktif }}</strong> dalam
        format <strong>{{ formatUnduhan }}</strong
        >?
      </p>
    </b-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import FormatRupiah from '@/components/FormatRupiah.vue'
import { toastRes, toastErr } from '@/helpers/toast'
import { useToast } from 'vue-toastification'

const toast = useToast()

const formatUnduhan = ref(null)
const modalKonfirmasi = ref(null)
const jenisLaporan = ref('')
const tanggalMulai = ref('')
const tanggalAkhir = ref('')
const jenisLaporanAktif = ref('')
const tanggalMulaiAktif = ref('')
const tanggalAkhirAktif = ref('')
const loading = ref(false)
const laporan = ref([])
const laporanSiapTampil = ref(false)
const tipeLaporan = ref(null)
const opsiLaporan = ref([])
const perPage = ref(10)
const totalRows = ref(0)
const halamanSaatIni = ref(1)
const perPageOptions = [
  { value: 10, text: '10' },
  { value: 25, text: '25' },
  { value: 50, text: '50' },
  { value: 'all', text: 'All' },
]
const laporanFields = ref([])

onMounted(async () => {
  try {
    const res = await axios.get('/laporan/opsi', {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      },
    })
    if (res.data.success) {
      opsiLaporan.value = res.data.data
    } else {
      toastRes(res)
    }
  } catch (err) {
    toastErr(err)
  }
})

const opsiSelect = computed(() => {
  const base = [
    { value: '', text: '-- Pilih Jenis Laporan --', disabled: jenisLaporan.value !== '' },
  ]
  const tambahan = opsiLaporan.value.map((o) => ({ value: o.value, text: o.text }))
  return [...base, ...tambahan]
})

const ambilLaporan = async () => {
  laporan.value = []
  laporanSiapTampil.value = false
  tipeLaporan.value = null
  halamanSaatIni.value = 1
  await loadData()
}

const loadData = async () => {
  try {
    loading.value = true
    const res = await axios.get(`/laporan/${jenisLaporan.value}`, {
      params: {
        start: tanggalMulai.value,
        end: tanggalAkhir.value,
        page: halamanSaatIni.value,
        per_page: perPage.value,
      },
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      },
    })

    if (!res.data.success) throw new Error(res.data.message || 'Gagal mengambil data')

    const found = opsiLaporan.value.find((o) => o.value === jenisLaporan.value)
    tipeLaporan.value = found?.tipe || null

    jenisLaporanAktif.value = jenisLaporan.value
    tanggalMulaiAktif.value = tanggalMulai.value
    tanggalAkhirAktif.value = tanggalAkhir.value

    if (tipeLaporan.value === 'ringkasan') {
      const data = res.data.data
      laporan.value = {
        pendapatan: Number(data.pendapatan || 0),
        pengeluaran: Number(data.pengeluaran || 0),
        laba_kotor: Number(data.laba_kotor || 0),
      }
    } else {
      if (perPage.value === 'all') {
        laporan.value = { data: res.data.data }
        totalRows.value = res.data.data.length
      } else {
        laporan.value = res.data.data
        totalRows.value = res.data.data.total || 0
      }

      if (laporan.value.data && laporan.value.data.length > 0) {
        laporanFields.value = [
          { key: 'no', label: 'No', tdClass: 'text-center', thStyle: 'text-align: center' },
          ...Object.keys(laporan.value.data[0]).map((key) => ({ key })),
        ]
      }
    }
    laporanSiapTampil.value = true
  } catch (err) {
    toastErr(err)
  } finally {
    loading.value = false
  }
}

const konfirmasiExport = (format) => {
  formatUnduhan.value = format
  modalKonfirmasi.value.show()
}

const exportLaporan = async (format) => {
  if (!jenisLaporanAktif.value || !tanggalMulaiAktif.value || !tanggalAkhirAktif.value) {
    toast.info('Silakan cari laporan terlebih dahulu sebelum mengunduh.')
    return
  }

  const endpoint = `/laporan/${jenisLaporan.value}/export/${format}`
  const params = new URLSearchParams({
    start: tanggalMulai.value,
    end: tanggalAkhir.value,
    token: sessionStorage.getItem('token'), // ⬅️ token dikirim via query param (hindari CORS)
  })

  if (format === 'pdf') {
    // 🔥 Buka tab baru untuk file PDF
    window.open(`${axios.defaults.baseURL}${endpoint}?${params.toString()}`, '_blank')
  } else {
    try {
      const response = await axios.get(`${endpoint}?${params.toString()}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      })

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `laporan_${jenisLaporan.value}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      toastErr(err)
    }
  }
}

watch([halamanSaatIni, perPage], async () => {
  if (laporanSiapTampil.value && tipeLaporan.value === 'tabel') {
    await loadData()
  }
})

watch([jenisLaporan, tanggalMulai, tanggalAkhir], () => {
  laporanSiapTampil.value = false
})
</script>
