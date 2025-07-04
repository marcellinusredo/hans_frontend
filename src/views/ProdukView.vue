<template>
  <div class="container py-5">
    <h2 class="fw-bold mb-4">Data Produk</h2>
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
          <!-- Tombol tambah data produk -->
          <b-button
            v-if="['Super Admin', 'Admin'].includes(nama_role)"
            title="Tambah Data Produk"
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

      <!-- Tabel Data Produk -->
      <b-table bordered striped hover :items="produk" :fields="fields" responsive>
        <!-- Header custom untuk sorting -->
        <template #head(nama_produk)>
          <th @click="changeSort('nama_produk')" style="cursor: pointer">
            Nama
            <span v-if="sortBy === 'nama_produk'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(nama_kategori)>
          <th @click="changeSort('nama_kategori')" style="cursor: pointer">
            Kategori
            <span v-if="sortBy === 'nama_kategori'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(kode_produk)>
          <th @click="changeSort('kode_produk')" style="cursor: pointer">
            Kode
            <span v-if="sortBy === 'kode_produk'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(harga_produk)>
          <th @click="changeSort('harga_produk')" style="cursor: pointer">
            Harga
            <span v-if="sortBy === 'harga_produk'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(stok_produk)>
          <th @click="changeSort('stok_produk')" style="cursor: pointer">
            Stok
            <span v-if="sortBy === 'stok_produk'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(deskripsi_produk)>
          <th @click="changeSort('deskripsi_produk')" style="cursor: pointer">
            Deskripsi
            <span v-if="sortBy === 'deskripsi_produk'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(gambar_produk)>
          <th @click="changeSort('gambar_produk')" style="cursor: pointer">
            Gambar
            <span v-if="sortBy === 'gambar_produk'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <!-- Nomor urut data -->
        <template #cell(index)="row">
          <div class="text-center">
            {{ row.index + 1 + (currentPage - 1) * perPage }}
          </div>
        </template>

        <!-- tampilkan Rupiah pada kolom harga -->
        <template #cell(harga_produk)="row">
          <FormatRupiah :value="Number(row.item.harga_produk)" />
        </template>

        <!-- tampilkan Gambar -->
        <template #cell(gambar_produk)="row">
          <div class="text-center">
            <img
              v-if="row.item.gambar_produk"
              :src="row.item.gambar_produk"
              alt="Gambar Produk"
              style="
                width: 80px;
                height: 80px;
                object-fit: contain;
                border-radius: 6px;
                background-color: #f9fafb;
                cursor: pointer;
              "
              @click="openImageModal(row.item.gambar_produk, row.item.nama_produk)"
            />
            <img
              v-else
              :src="noImage"
              alt="Gambar Default"
              style="
                width: 80px;
                height: 80px;
                object-fit: contain;
                border-radius: 6px;
                background-color: #f9fafb;
                opacity: 0.5;
              "
              @click="openImageModal(noImage, 'Gambar tidak tersedia')"
            />
          </div>
        </template>

        <!-- Tombol aksi edit & hapus -->
        <template #cell(actions)="row">
          <div
            v-if="['Super Admin', 'Admin'].includes(nama_role)"
            class="d-flex justify-content-center gap-2"
          >
            <!-- Tombol edit -->
            <b-button
              title="Edit Data Produk"
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

            <!-- tombol hapus -->
            <b-button
              title="Hapus Data Produk"
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

    <!-- Modal Tambah/Edit Produk -->
    <b-modal
      v-if="['Super Admin', 'Admin'].includes(nama_role)"
      v-model="showFormProduk"
      :title="isEdit ? 'Edit Produk' : 'Tambah Produk'"
      @ok.prevent="simpanProduk"
      ok-title="Simpan"
      cancel-title="Batal"
      :ok-disabled="loadingSimpan"
      :cancel-disabled="loadingSimpan"
      centered
      @hidden="resetForm"
      title-class="fw-bold text-center w-100"
      footer-class="d-flex justify-content-between"
      size="lg"
    >
      <form ref="formProduk">
        <!-- Nama -->
        <b-row class="mb-3 align-items-center">
          <b-col sm="3"
            ><label class="form-label">Nama <span style="color: red">*</span></label></b-col
          >
          <b-col sm="9">
            <b-form-input
              v-model="produkEdit.nama_produk"
              required
              size="sm"
              placeholder="Masukkan nama"
            />
          </b-col>
        </b-row>

        <!-- Kategori -->
        <b-row class="mb-3 align-items-center">
          <b-col sm="3"
            ><label class="form-label">Kategori <span style="color: red">*</span></label></b-col
          >
          <b-col sm="9">
            <b-form-select
              v-model="produkEdit.kategori_id"
              :options="kategoriOptions"
              required
              size="sm"
            >
              <!-- pilihan awal -->
              <template #first>
                <b-form-select-option :value="null" disabled>
                  -- Pilih kategori --
                </b-form-select-option>
              </template>
            </b-form-select>
          </b-col>
        </b-row>

        <!-- Kode -->
        <b-row class="mb-3 align-items-center">
          <b-col sm="3"
            ><label class="form-label">Kode Produk <span style="color: red">*</span></label></b-col
          >
          <b-col sm="9">
            <b-form-input
              v-model="produkEdit.kode_produk"
              size="sm"
              placeholder="Masukkan nomor kode produk"
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
                <span class="input-group-text"> Rp. </span>
              </template>
              <b-form-input
                v-model.number="produkEdit.harga_produk"
                required
                type="number"
                min="0"
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
              v-model="produkEdit.deskripsi_produk"
              size="sm"
              placeholder="Deskripsi lengkap"
              rows="3"
              max-rows="6"
            />
          </b-col>
        </b-row>

        <!-- Checkbox Ganti/Hapus Gambar (hanya saat edit) -->
        <b-row v-if="isEdit" class="mb-3 align-items-center">
          <b-col sm="6">
            <b-form-checkbox
              v-model="gantiGambar"
              :disabled="hapusGambar"
              @change="hapusGambar = false"
            >
              Ubah Gambar
            </b-form-checkbox>
          </b-col>
          <b-col sm="6">
            <b-form-checkbox
              v-model="hapusGambar"
              :disabled="gantiGambar"
              @change="gantiGambar = false"
            >
              Hapus Gambar
            </b-form-checkbox>
          </b-col>
        </b-row>

        <!-- Input Gambar -->
        <b-row v-if="!isEdit || gantiGambar" class="mb-3 align-items-center">
          <b-col sm="3">
            <label class="form-label">
              Gambar Produk
              <span v-if="isEdit" style="color: red">*</span>
            </label>
          </b-col>
          <b-col sm="9">
            <b-form-file
              v-model="produkEdit.gambar_produk"
              :required="gantiGambar"
              accept="image/*"
              size="sm"
              placeholder="Pilih gambar (boleh kosong)"
              type="file"
              @change="handleFileChange"
            />
          </b-col>
        </b-row>
      </form>
    </b-modal>

    <!--Modal preview gambar -->
    <b-modal v-model="showImageModal" :title="selectedProductName" size="lg" no-footer>
      <div class="text-center">
        <img :src="selectedImage" alt="Preview Gambar" style="max-width: 100%; height: auto" />
      </div>
    </b-modal>

    <!-- Modal Konfirmasi Hapus -->
    <b-modal
      v-if="['Super Admin', 'Admin'].includes(nama_role)"
      v-model="showKonfirmasiHapus"
      title="Konfirmasi Hapus"
      @ok="hapusProduk"
      ok-title="Hapus"
      cancel-title="Tidak"
      ok-variant="danger"
      centered
      title-class="fw-bold text-center w-100"
      footer-class="d-flex justify-content-between flex-row-reverse"
    >
      <div>
        Apakah Anda yakin ingin menghapus data <strong>{{ produkDihapus?.nama_produk }}</strong
        >?
      </div>
    </b-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import FormatRupiah from '@/components/FormatRupiah.vue'
import noImage from '@/assets/images/no-image.png'
import { toastRes, toastErr } from '@/helpers/toast'
import { useToast } from 'vue-toastification'

const toast = useToast()

const nama_role = sessionStorage.getItem('nama_role')

// Data produk yang ditampilkan di tabel // eslint-disable-line
const produk = ref([])

// State untuk pencarian, pagination, dan sorting // eslint-disable-line
const search = ref('')
const perPage = ref(5)
const currentPage = ref(1)
const totalRows = ref(0)
const sortBy = ref('nama_produk')
const sortDir = ref('asc')

// State untuk modal tambah/edit dan loading // eslint-disable-line
const showFormProduk = ref(false)
const loadingSimpan = ref(false)

// State untuk modal konfirmasi hapus // eslint-disable-line
const showKonfirmasiHapus = ref(false)
const produkDihapus = ref(null)

// Apakah sedang mode edit atau tambah // eslint-disable-line
const isEdit = ref(false)

// State untuk ganti gambar // eslint-disable-line
const gantiGambar = ref(false)
const hapusGambar = ref(false)

// State untuk view gammbar // eslint-disable-line
const showImageModal = ref(false)
const selectedImage = ref('')
const selectedProductName = ref('')

// Data produk yang sedang diubah atau ditambahkan // eslint-disable-line
const produkEdit = ref({
  nama_produk: '',
  kode_produk: '',
  nama_kategori: '',
  harga_produk: '',
  stok_produk: '',
  deskripsi_produk: '',
  gambar_produk: '',
  kategori_id: null,
})

// Data produk sebelum diedit, digunakan untuk mengecek perubahan // eslint-disable-line
const produkEditBefore = ref(null)

// Daftar kategori yang tersedia, untuk dropdown select kategori // eslint-disable-line
const kategoriOptions = ref([])

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
  { key: 'nama_produk', label: 'Nama', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'nama_kategori', label: 'Kategori', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'kode_produk', label: 'Kode', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'harga_produk', label: 'Harga', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'stok_produk', label: 'Stok', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'deskripsi_produk', label: 'Deskripsi', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'gambar_produk', label: 'Gambar', thClass: 'text-center', tdClass: 'text-start' },
  ...(['Super Admin', 'Admin'].includes(nama_role)
    ? [{ key: 'actions', label: 'Action', thClass: 'text-center', tdClass: 'text-center' }]
    : []),
]

// Referensi ke form dalam modal // eslint-disable-line
const formProduk = ref(null)

// Fungsi untuk mengambil data produk dari API // eslint-disable-line
async function fetchProduk() {
  const token = sessionStorage.getItem('token')
  try {
    const res = await axios.get('/produk', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: currentPage.value,
        per_page: perPage.value,
        search: search.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
      },
    })
    produk.value = res.data.data
    totalRows.value = res.data.pagination.total
  } catch (error) {
    toastErr(error)
  }
}

// Memantau perubahan filter & sorting untuk refresh data otomatis // eslint-disable-line
watch([currentPage, perPage, search, sortBy, sortDir], () => {
  currentPage.value = currentPage.value < 1 ? 1 : currentPage.value
  fetchProduk()
})

// Reset halaman ke 1 jika perPage atau search berubah // eslint-disable-line
watch([perPage, search], () => {
  currentPage.value = 1
})

// Saat komponen pertama kali dimuat, ambil data produk dan kategori // eslint-disable-line
onMounted(async () => {
  const token = sessionStorage.getItem('token')
  try {
    await fetchProduk()
    if (['Super Admin', 'Admin'].includes(nama_role)) {
      const kategoriRes = await axios.get('/kategori', {
        headers: { Authorization: `Bearer ${token}` },
      })
      kategoriOptions.value = kategoriRes.data.data.map((r) => ({
        value: r.id_kategori,
        text: r.nama_kategori,
      }))
    }
  } catch (err) {
    toastErr(err)
  }
})

// Reset form produk (digunakan saat menutup form/modal) // eslint-disable-line
function resetForm() {
  produkEdit.value = {
    nama_produk: '',
    kode_produk: '',
    nama_kategori: '',
    harga_produk: '',
    stok_produk: '',
    deskripsi_produk: '',
    gambar_produk: null,
    kategori_id: null,
  }
  produkEditBefore.value = null
  isEdit.value = false
  gantiGambar.value = false
  hapusGambar.value = false
}

// Membuka form modal untuk tambah data // eslint-disable-line
function openFormTambah() {
  resetForm()
  showFormProduk.value = true
}

// Membuka form modal untuk edit data, dan simpan data awal // eslint-disable-line
function onEdit(item) {
  produkEdit.value = { ...item }
  produkEditBefore.value = { ...item }
  isEdit.value = true
  showFormProduk.value = true
  gantiGambar.value = false
  hapusGambar.value = false
}

// Mengecek apakah ada data yang berubah (digunakan sebelum update) // eslint-disable-line
function isDataChanged(before, after, gantiGambarVal, hapusGambarVal) {
  const keys = [
    'nama_produk',
    'kode_produk',
    'harga_produk',
    'stok_produk',
    'deskripsi_produk',
    'kategori_id',
  ]

  return (
    keys.some((key) => before[key] !== after[key]) ||
    after.gambar_produk instanceof File || // jika user mengganti file
    gantiGambarVal ||
    hapusGambarVal
  )
}

// Menyimpan data produk (baik tambah baru maupun edit) // eslint-disable-line
async function simpanProduk() {
  const form = formProduk.value
  if (form && !form.checkValidity()) {
    form.reportValidity()
    return
  }

  loadingSimpan.value = true
  const token = sessionStorage.getItem('token')

  // FormData untuk mengirim file
  const dataToSend = new FormData()
  dataToSend.append('nama_produk', produkEdit.value.nama_produk)
  dataToSend.append('kode_produk', produkEdit.value.kode_produk)
  dataToSend.append('harga_produk', produkEdit.value.harga_produk)
  dataToSend.append('deskripsi_produk', produkEdit.value.deskripsi_produk ?? '')
  dataToSend.append('kategori_id', produkEdit.value.kategori_id)

  // Tambahkan gambar hanya jika dipilih
  if (produkEdit.value.gambar_produk instanceof File) {
    dataToSend.append('gambar_produk', produkEdit.value.gambar_produk)
  }

  try {
    if (isEdit.value) {
      dataToSend.append('ganti_gambar', gantiGambar.value)
      dataToSend.append('hapus_gambar', hapusGambar.value)
      if (
        !isDataChanged(
          produkEditBefore.value,
          produkEdit.value,
          gantiGambar.value,
          hapusGambar.value,
        )
      ) {
        toast.info('Tidak ada data yang diubah')
        showFormProduk.value = false
        loadingSimpan.value = false
        return
      }
      dataToSend.append('_method', 'PUT')
      const res = await axios.post(`/produk/${produkEdit.value.id_produk}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      toastRes(res)
    } else {
      const res = await axios.post('/produk', dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      toastRes(res)
    }

    showFormProduk.value = false
    fetchProduk()
  } catch (error) {
    toastErr(error)
  } finally {
    loadingSimpan.value = false
  }
}

// Menyimpan data produk yang akan dihapus dan membuka modal konfirmasi // eslint-disable-line
function onDelete(item) {
  produkDihapus.value = item
  showKonfirmasiHapus.value = true
}

// Menghapus data produk dari server // eslint-disable-line
async function hapusProduk() {
  const token = sessionStorage.getItem('token')
  try {
    const res = await axios.delete(`/produk/${produkDihapus.value.id_produk}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    toastRes(res)
    showKonfirmasiHapus.value = false
    fetchProduk()
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

// Mengatur perubahan // eslint-disable-line
function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    produkEdit.value.gambar_produk = file
  }
}

// Membuak gambar // eslint-disable-line
function openImageModal(url, namaProduk) {
  selectedImage.value = url
  selectedProductName.value = namaProduk
  showImageModal.value = true
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
