<template>
  <div class="container py-5">
    <h2 class="fw-bold mb-4">Data Jasa</h2>
    <!-- Border Rounded -->
    <div class="bg-white p-5 shadow rounded mt-4">
      <!-- Bar Atas: Pilihan jumlah data per halaman, tombol tambah, dan pencarian -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <!-- Atur jumlah data per halaman -->
        <div class="d-flex align-items-center gap-2">
          <i
            class="bi bi-grid"
            title="Atur jumlah data per halaman"
            style="font-size: 1.2rem; cursor: pointer; color: #4b5563"
          ></i>
          <b-form-select v-model="perPage" :options="perPageOptions" class="w-auto" />
        </div>

        <div class="d-flex align-items-center gap-2 flex-grow-1 justify-content-end">
          <!-- Tombol tambah data jasa -->
          <b-button
            v-if="['Super Admin', 'Admin'].includes(nama_role)"
            title="Tambah Data Jasa"
            variant="light"
            class="text-white"
            style="
              background-color: #3b82f6;
              border: none;
              font-weight: 500;
              padding: 8px 16px;
              border-radius: 6px;
              transition: background-color 0.3s;
            "
            @click="openFormTambah"
          >
            <i class="bi bi-plus-circle me-2"></i> Tambah
          </b-button>

          <!-- Pencarian -->
          <div
            class="search-wrapper d-flex align-items-center flex-grow-1"
            style="max-width: 300px"
          >
            <b-form-input v-model="search" placeholder="Search" class="border-bottom p-2" />
            <i class="bi bi-search ms-2" style="font-size: 1.2rem; color: #666"></i>
          </div>
        </div>
      </div>

      <!-- Tabel Data jasa -->
      <b-table bordered striped hover :items="jasa" :fields="fields" responsive>
        <!-- Header custom untuk sorting -->
        <template #head(nama_jasa)>
          <th @click="changeSort('nama_jasa')" style="cursor: pointer">
            Nama
            <span v-if="sortBy === 'nama_jasa'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(harga_jasa)>
          <th @click="changeSort('harga_jasa')" style="cursor: pointer">
            Harga
            <span v-if="sortBy === 'harga_jasa'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(deskripsi_jasa)>
          <th @click="changeSort('deskripsi_jasa')" style="cursor: pointer">
            Deskripsi
            <span v-if="sortBy === 'deskripsi_jasa'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <!-- Nomor urut data -->
        <template #cell(index)="row">
          <div class="text-center">
            {{ row.index + 1 + (currentPage - 1) * perPage }}
          </div>
        </template>

        <!-- tampilkan Rupiah pada kolom harga -->
        <template #cell(harga_jasa)="row">
          <FormatRupiah :value="Number(row.item.harga_jasa)" />
        </template>

        <!-- Tombol aksi edit & hapus -->
        <template #cell(actions)="row">
          <div
            v-if="['Super Admin', 'Admin'].includes(nama_role)"
            class="d-flex justify-content-center gap-2"
          >
            <!-- Tombol edit -->
            <b-button
              title="Edit Data Jasa"
              size="sm"
              variant="light"
              style="
                background-color: #facc15;
                color: #1f2937;
                border: none;
                border-radius: 6px;
                padding: 4px 8px;
              "
              @click="onEdit(row.item)"
            >
              <i class="bi bi-pencil"></i>
            </b-button>

            <!-- Tombol aksi hapus -->
            <b-button
              title="Hapus Data Jasa"
              size="sm"
              variant="light"
              style="
                background-color: #f87171;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 4px 8px;
              "
              @click="onDelete(row.item)"
            >
              <i class="bi bi-trash"></i>
            </b-button>
          </div>
        </template>
      </b-table>

      <!-- Total data -->
      <div class="text-end mt-2"><strong>Total Data: </strong>{{ totalRows }}</div>

      <!-- Pagination -->
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        align="center"
        class="mt-3"
      />
    </div>

    <!-- Modal Tambah/Edit jasa -->
    <b-modal
      v-model="showFormJasa"
      v-if="['Super Admin', 'Admin'].includes(nama_role)"
      :title="isEdit ? 'Edit Jasa' : 'Tambah Jasa'"
      @ok.prevent="simpanJasa"
      ok-title="Simpan"
      cancel-title="Batal"
      :ok-disabled="loadingSimpan"
      :cancel-disabled="loadingSimpan"
      centered
      @hidden="resetForm"
      title-class="fw-bold text-center w-100"
      footer-class="d-flex justify-content-between"
    >
      <form ref="formJasa">
        <!-- Nama -->
        <b-row class="mb-3 align-items-center">
          <b-col sm="3"
            ><label class="form-label">Nama <span style="color: red">*</span></label></b-col
          >
          <b-col sm="9">
            <b-form-input
              v-model="jasaEdit.nama_jasa"
              required
              minlength="1"
              maxlength="25"
              size="sm"
              placeholder="Masukkan nama"
            />
          </b-col>
        </b-row>

        <!-- Harga -->
        <b-row class="mb-3 align-items-center">
          <b-col sm="3">
            <label class="form-label">Harga <span style="color: red">*</span></label>
          </b-col>
          <b-col sm="9">
            <b-input-group size="sm">
              <template #prepend>
                <span class="input-group-text">Rp.</span>
              </template>
              <b-form-input
                v-model.number="jasaEdit.harga_jasa"
                required
                type="number"
                min="1000"
                max="999999999999999999"
                step="1"
                placeholder="Masukkan harga"
              />
            </b-input-group>
          </b-col>
        </b-row>

        <!-- Deskripsi -->
        <b-row class="mb-3 align-items-center">
          <b-col sm="3"><label class="form-label">Deskripsi </label></b-col>
          <b-col sm="9">
            <b-form-textarea
              v-model="jasaEdit.deskripsi_jasa"
              maxlength="255"
              size="sm"
              placeholder="Deskripsi lengkap"
              rows="3"
              max-rows="6"
            />
          </b-col>
        </b-row>
      </form>
    </b-modal>

    <!-- Modal Konfirmasi Hapus -->
    <b-modal
      v-model="showKonfirmasiHapus"
      v-if="['Super Admin', 'Admin'].includes(nama_role)"
      title="Konfirmasi Hapus"
      @ok="hapusJasa"
      ok-title="Hapus"
      cancel-title="Tidak"
      ok-variant="danger"
      centered
      title-class="fw-bold text-center w-100"
      footer-class="d-flex justify-content-between flex-row-reverse"
    >
      <div>
        Apakah Anda yakin ingin menghapus data <strong>{{ jasaDihapus?.nama_jasa }}</strong
        >?
      </div>
    </b-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { toastRes, toastErr } from '@/helpers/toast'
import FormatRupiah from '@/components/FormatRupiah.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const nama_role = sessionStorage.getItem('nama_role')

// Data staff yang ditampilkan di tabel // eslint-disable-line
const jasa = ref([])

// State untuk pencarian, pagination, dan sorting // eslint-disable-line
const search = ref('')
const perPage = ref(5)
const currentPage = ref(1)
const totalRows = ref(0)
const sortBy = ref('nama_jasa')
const sortDir = ref('asc')

// State untuk modal tambah/edit dan loading // eslint-disable-line
const showFormJasa = ref(false)
const loadingSimpan = ref(false)

// State untuk modal konfirmasi hapus // eslint-disable-line
const showKonfirmasiHapus = ref(false)
const jasaDihapus = ref(null)

// Apakah sedang mode edit atau tambah // eslint-disable-line
const isEdit = ref(false)

// Data staff yang sedang diubah atau ditambahkan // eslint-disable-line
const jasaEdit = ref({
  nama_jasa: '',
  harga_jasa: '',
  deskripsi_jasa: '',
})

// Data staff sebelum diedit, digunakan untuk mengecek perubahan // eslint-disable-line
const jasaEditBefore = ref(null)

// Pilihan jumlah data per halaman // eslint-disable-line
const perPageOptions = [
  { value: 5, text: '5' },
  { value: 10, text: '10' },
  { value: 15, text: '15' },
  { value: 20, text: '20' },
]

// Field yang ditampilkan di tabel, dengan pengaturan label dan alignment // eslint-disable-line
const fields = [
  { key: 'index', label: 'No', thClass: 'text-center', tdClass: 'text-center' },
  { key: 'nama_jasa', label: 'Nama', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'harga_jasa', label: 'Harga', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'deskripsi_jasa', label: 'Deskripsi', thClass: 'text-center', tdClass: 'text-start' },
  ...(['Super Admin', 'Admin'].includes(nama_role)
    ? [{ key: 'actions', label: 'Action', thClass: 'text-center', tdClass: 'text-center' }]
    : []),
]

// Referensi ke form dalam modal // eslint-disable-line
const formJasa = ref(null)

// Fungsi untuk mengambil data jasa dari API // eslint-disable-line
async function fetchJasa() {
  const token = sessionStorage.getItem('token')
  try {
    const res = await axios.get('/jasa', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: currentPage.value,
        per_page: perPage.value,
        search: search.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
      },
    })
    jasa.value = res.data.data
    totalRows.value = res.data.pagination.total
  } catch (error) {
    toastErr(error)
  }
}

// Memantau perubahan filter & sorting untuk refresh data otomatis // eslint-disable-line
watch([currentPage, perPage, search, sortBy, sortDir], () => {
  currentPage.value = currentPage.value < 1 ? 1 : currentPage.value
  fetchJasa()
})

// Reset halaman ke 1 jika perPage atau search berubah // eslint-disable-line
watch([perPage, search], () => {
  currentPage.value = 1
})

// Saat komponen pertama kali dimuat, ambil data jasa  // eslint-disable-line
onMounted(async () => {
  try {
    await fetchJasa()
  } catch (error) {
    toastErr(error)
  }
})

// Reset form jasa (digunakan saat menutup form/modal) // eslint-disable-line
function resetForm() {
  jasaEdit.value = {
    nama_jasa: '',
    harga_jasa: '',
    deskripsi_jasa: '',
  }
  jasaEditBefore.value = null
  isEdit.value = false
}

// Membuka form modal untuk tambah data // eslint-disable-line
function openFormTambah() {
  resetForm()
  showFormJasa.value = true
}

// Membuka form modal untuk edit data, dan simpan data awal // eslint-disable-line
function onEdit(item) {
  jasaEdit.value = { ...item }
  jasaEditBefore.value = { ...item }
  isEdit.value = true
  showFormJasa.value = true
}

// Mengecek apakah ada data yang berubah (digunakan sebelum update) // eslint-disable-line
function isDataChanged(before, after) {
  const keys = ['nama_jasa', 'harga_jasa', 'deskripsi_jasa']
  return keys.some((key) => before[key] !== after[key])
}

// Menyimpan data jasa (baik tambah baru maupun edit) // eslint-disable-line
async function simpanJasa() {
  const form = formJasa.value
  if (form && !form.checkValidity()) {
    form.reportValidity()
    return
  }

  loadingSimpan.value = true
  const token = sessionStorage.getItem('token')

  if (isEdit.value) {
    const dataToSend = { ...jasaEdit.value }

    if (!isDataChanged(jasaEditBefore.value, jasaEdit.value)) {
      toast.info('Tidak ada data yang diubah')
      showFormJasa.value = false
      loadingSimpan.value = false
      return
    }

    try {
      const res = await axios.put(`/jasa/${dataToSend.id_jasa}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toastRes(res)
      showFormJasa.value = false
      fetchJasa()
    } catch (error) {
      toastErr(error)
    } finally {
      loadingSimpan.value = false
    }
  } else {
    try {
      const res = await axios.post('/jasa', jasaEdit.value, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toastRes(res)
      showFormJasa.value = false
      fetchJasa()
    } catch (error) {
      toastErr(error)
    } finally {
      loadingSimpan.value = false
    }
  }
}

// Menyimpan data jasa yang akan dihapus dan membuka modal konfirmasi // eslint-disable-line
function onDelete(item) {
  jasaDihapus.value = item
  showKonfirmasiHapus.value = true
}

// Menghapus data staff dari server // eslint-disable-line
async function hapusJasa() {
  const token = sessionStorage.getItem('token')
  try {
    const res = await axios.delete(`/jasa/${jasaDihapus.value.id_jasa}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    toastRes(res)
    showKonfirmasiHapus.value = false
    fetchJasa()
  } catch (error) {
    toastErr(error)
  }
}

// Mengatur sorting kolom di tabel // eslint-disable-line
function changeSort(field) {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortDir.value = 'asc'
  }
}
</script>

<style scoped>
/* Styling khusus untuk search input agar terlihat minimalis */
.search-wrapper input {
  border: none; /* hilangkan semua border */
  outline: none; /* hilangkan garis fokus bawaan */
  padding: 6px 8px;
}
</style>
