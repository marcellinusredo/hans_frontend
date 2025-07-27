<template>
  <div class="container py-5">
    <h2 class="fw-bold mb-4">Data Laporan</h2>
    <div class="bg-white p-5 shadow rounded mt-4">
      <!-- Form filter laporan -->
      <b-card class="mb-3 w-100">
        <b-form @submit.prevent="ambilLaporan">
          <b-row class="gy-3 gx-3">
            <!-- Jenis Laporan -->
            <b-col cols="12" md="3">
              <b-form-group label="Jenis Laporan" class="mb-0">
                <b-form-select v-model="jenisLaporan" :options="opsiSelect" required />
              </b-form-group>
            </b-col>

            <!-- Tanggal Mulai -->
            <b-col cols="12" md="3">
              <b-form-group label="Tanggal Mulai" class="mb-0">
                <b-form-input
                  type="date"
                  v-model="tanggalMulai"
                  :required="laporanButuhTanggal"
                  :disabled="!laporanButuhTanggal"
                />
              </b-form-group>
            </b-col>

            <!-- Tanggal Akhir -->
            <b-col cols="12" md="3">
              <b-form-group label="Tanggal Akhir" class="mb-0">
                <b-form-input
                  type="date"
                  v-model="tanggalAkhir"
                  :required="laporanButuhTanggal"
                  :disabled="!laporanButuhTanggal"
                />
              </b-form-group>
            </b-col>

            <!-- Tombol Aksi -->
            <b-col cols="12" md="3" class="d-flex align-items-end">
              <b-button
                type="submit"
                title="Cari"
                variant="primary"
                class="fw-semibold w-100 d-flex align-items-center justify-content-center"
              >
                <i class="bi bi-search me-2"></i> Cari
              </b-button>
            </b-col>
          </b-row>
        </b-form>
      </b-card>
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

    <!-- Modal untuk laporan -->
    <b-modal
      v-model="showModal"
      size="xl"
      title="Laporan"
      title-class="text-center w-100 fw-bold"
      centered
      scrollable
      no-footer
      @hide="resetLaporan"
    >
      <div class="d-flex justify-content-end mb-3">
        <b-dropdown
          variant="success"
          :disabled="!laporanSiapTampil || loading || !laporan.data || laporan.data.length === 0"
          toggle-class="fw-semibold d-flex align-items-center justify-content-center px-3"
        >
          <template #button-content> <i class="bi bi-download me-2"></i> Download </template>
          <b-dropdown-item @click="konfirmasiExport('pdf')">
            <i class="bi bi-file-earmark-pdf-fill me-2"></i> Export PDF
          </b-dropdown-item>
          <b-dropdown-item @click="konfirmasiExport('excel')">
            <i class="bi bi-file-earmark-excel-fill me-2"></i> Export Excel
          </b-dropdown-item>
        </b-dropdown>
      </div>

      <div v-if="loading" class="text-center my-5">
        <b-spinner label="Memuat..."></b-spinner>
      </div>

      <template v-else>
        <div v-if="tipeLaporan === 'ringkasan' && laporan">
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
        </div>

        <div v-else-if="tipeLaporan === 'tabel' && laporan.data && laporan.data.length > 0">
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
          </b-table>

          <div class="d-flex justify-content-between mt-3" v-if="perPage !== 'all'">
            <div><strong>Total Data:</strong> {{ totalRows }}</div>
            <b-pagination
              v-model="halamanSaatIni"
              :total-rows="totalRows"
              :per-page="perPage"
              align="right"
            />
          </div>
        </div>

        <div v-else class="text-center py-4 text-muted">
          <i class="bi bi-exclamation-circle-fill me-2"></i> Data tidak ditemukan.
        </div>
      </template>

      <template #modal-footer>
        <b-button
          variant="success"
          :disabled="!laporanSiapTampil || loading"
          @click="konfirmasiExport('pdf')"
        >
          <i class="bi bi-file-earmark-pdf-fill me-2"></i> Download PDF
        </b-button>
        <b-button
          variant="success"
          :disabled="!laporanSiapTampil || loading"
          @click="konfirmasiExport('excel')"
        >
          <i class="bi bi-file-earmark-excel-fill me-2"></i> Download Excel
        </b-button>
        <b-button variant="secondary" @click="showModal = false">Tutup</b-button>
      </template>
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
const showModal = ref(false)

const resetLaporan = () => {
  laporan.value = []
  laporanSiapTampil.value = false
  tipeLaporan.value = null
  halamanSaatIni.value = 1
}

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
  resetLaporan()
  await loadData()
  showModal.value = true
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
  const butuhTanggal = laporanButuhTanggal.value

  if (
    !jenisLaporanAktif.value ||
    (butuhTanggal && (!tanggalMulaiAktif.value || !tanggalAkhirAktif.value))
  ) {
    toast.info('Silakan cari laporan terlebih dahulu sebelum mengunduh.')
    return
  }

  const token = sessionStorage.getItem('token')
  const jenis = jenisLaporan.value
  const endpoint = `/laporan/${jenis}/export/${format}`

  const params = new URLSearchParams()
  if (butuhTanggal) {
    params.append('start', tanggalMulai.value)
    params.append('end', tanggalAkhir.value)
  }

  if (format === 'pdf') {
    try {
      const response = await axios.get(`${endpoint}?${params.toString()}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
    } catch (err) {
      toast.error('Gagal membuka file PDF laporan.')
      console.error('Error download PDF:', err)
    }
  } else {
    try {
      const response = await axios.get(`${endpoint}?${params.toString()}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `laporan_${jenis}.xlsx`
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

watch(jenisLaporan, (val) => {
  if (val === 'stok-produk') {
    toast.info('Laporan ini tidak memerlukan filter tanggal.')
  }
})

const laporanButuhTanggal = computed(() =>
  ['transaksi', 'produk-terlaris', 'jasa-terlaris', 'pengadaan-produk', 'keuangan'].includes(
    jenisLaporan.value,
  ),
)
</script>
