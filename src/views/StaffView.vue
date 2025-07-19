<template>
  <div class="container py-5">
    <h2 class="fw-bold mb-4">Data Staff</h2>
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
          <!-- Tombol tambah data staff -->
          <b-button
            title="Tambah Data Staff"
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

      <!-- Tabel Data Staff -->
      <b-table bordered striped hover :items="staff" :fields="fields" responsive>
        <!-- Header custom untuk sorting -->
        <template #head(nama_staff)>
          <th @click="changeSort('nama_staff')" style="cursor: pointer">
            Nama
            <span v-if="sortBy === 'nama_staff'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(nomor_telp_staff)>
          <th @click="changeSort('nomor_telp_staff')" style="cursor: pointer">
            Telp
            <span v-if="sortBy === 'nomor_telp_staff'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(alamat_staff)>
          <th @click="changeSort('alamat_staff')" style="cursor: pointer">
            Alamat
            <span v-if="sortBy === 'alamat_staff'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(username_staff)>
          <th @click="changeSort('username_staff')" style="cursor: pointer">
            Username
            <span v-if="sortBy === 'username_staff'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(nama_role)>
          <th @click="changeSort('nama_role')" style="cursor: pointer">
            Role
            <span v-if="sortBy === 'nama_role'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <!-- Nomor urut data -->
        <template #cell(index)="row">
          <div class="text-center">
            {{ row.index + 1 + (currentPage - 1) * perPage }}
          </div>
        </template>

        <!-- Tombol aksi edit & hapus -->
        <template #cell(actions)="row">
          <div class="d-flex justify-content-center gap-2">
            <!-- Tombol edit -->
            <b-button
              title="Edit Data Staff"
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

            <!-- Tombol hapus -->
            <b-button
              title="Hapus Data Staff"
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

    <!-- Modal Tambah/Edit Staff -->
    <b-modal
      v-model="showFormStaff"
      :title="isEdit ? 'Edit Staff' : 'Tambah Staff'"
      @ok.prevent="simpanStaff"
      ok-title="Simpan"
      cancel-title="Batal"
      :ok-disabled="loadingSimpan"
      :cancel-disabled="loadingSimpan"
      centered
      @hidden="resetForm"
      title-class="fw-bold text-center w-100"
      footer-class="d-flex justify-content-between"
    >
      <form ref="formStaff">
        <!-- Nama -->
        <b-row class="mb-3 align-items-center">
          <b-col sm="3"
            ><label class="form-label">Nama <span style="color: red">*</span></label></b-col
          >
          <b-col sm="9">
            <b-form-input
              v-model="staffEdit.nama_staff"
              required
              minlength="1"
              maxlength="25"
              size="sm"
              placeholder="Masukkan nama"
            />
          </b-col>
        </b-row>

        <!-- Nomor Telp -->
        <b-row class="mb-3 align-items-center">
          <b-col sm="3"><label class="form-label">Nomor Telp</label></b-col>
          <b-col sm="9">
            <b-form-input
              v-model="staffEdit.nomor_telp_staff"
              type="tel"
              pattern="0[0-9]{9,14}"
              minlength="10"
              maxlength="15"
              size="sm"
              placeholder="Masukkan nomor (10–15 digit dan diawali dengan 0)"
              @input="hanyaAngka"
            />
          </b-col>
        </b-row>

        <!-- Alamat -->
        <b-row class="mb-3 align-items-center">
          <b-col sm="3"><label class="form-label">Alamat </label></b-col>
          <b-col sm="9">
            <b-form-input
              v-model="staffEdit.alamat_staff"
              size="sm"
              maxlength="50"
              placeholder="Alamat lengkap"
            />
          </b-col>
        </b-row>

        <!-- Username -->
        <b-row class="mb-3 align-items-center">
          <b-col sm="3"
            ><label class="form-label">Username <span style="color: red">*</span></label></b-col
          >
          <b-col sm="9">
            <b-form-input
              v-model="staffEdit.username_staff"
              required
              minlength="4"
              maxlength="25"
              size="sm"
              placeholder="Username login"
            />
          </b-col>
        </b-row>

        <!-- Checkbox Ganti Password (hanya saat edit) -->
        <b-row v-if="isEdit" class="mb-3 align-items-center">
          <b-col sm="9">
            <b-form-checkbox v-model="gantiPassword">Aktifkan untuk ubah password</b-form-checkbox>
          </b-col>
        </b-row>

        <!-- Password -->
        <b-row v-if="!isEdit || gantiPassword" class="mb-3 align-items-center">
          <b-col sm="3">
            <label class="form-label">
              Password
              <span style="color: red">*</span>
            </label>
          </b-col>
          <b-col sm="9">
            <b-form-input
              v-model="staffEdit.password_staff"
              type="password"
              :required="!isEdit || gantiPassword"
              minlength="6"
              maxlength="25"
              size="sm"
              placeholder="Masukkan password minimal 6 karakter"
            />
          </b-col>
        </b-row>

        <!-- Role -->
        <b-row class="mb-3 align-items-center">
          <b-col sm="3"
            ><label class="form-label">Role <span style="color: red">*</span></label></b-col
          >
          <b-col sm="9">
            <b-form-select
              v-model="staffEdit.role_id"
              :options="roleOptions"
              required
              size="sm"
              placeholder="Pilih role"
            >
              <!-- pilihan awal -->
              <template #first>
                <b-form-select-option :value="null" disabled>-- Pilih Role --</b-form-select-option>
              </template>
            </b-form-select>
          </b-col>
        </b-row>
      </form>
    </b-modal>

    <!-- Modal Konfirmasi Hapus -->
    <b-modal
      v-model="showKonfirmasiHapus"
      title="Konfirmasi Hapus"
      @ok="hapusStaff"
      ok-title="Hapus"
      cancel-title="Tidak"
      ok-variant="danger"
      centered
      title-class="fw-bold text-center w-100"
      footer-class="d-flex justify-content-between flex-row-reverse"
    >
      <div>
        Apakah Anda yakin ingin menghapus data <strong>{{ staffDihapus?.nama_staff }}</strong
        >?
      </div>
    </b-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { toastRes, toastErr } from '@/helpers/toast'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Data staff yang ditampilkan di tabel // eslint-disable-line
const staff = ref([])

// State untuk pencarian, pagination, dan sorting // eslint-disable-line
const search = ref('')
const perPage = ref(5)
const currentPage = ref(1)
const totalRows = ref(0)
const sortBy = ref('nama_staff')
const sortDir = ref('asc')

// State untuk modal tambah/edit dan loading // eslint-disable-line
const showFormStaff = ref(false)
const loadingSimpan = ref(false)

// State untuk modal konfirmasi hapus // eslint-disable-line
const showKonfirmasiHapus = ref(false)
const staffDihapus = ref(null)

// Apakah sedang mode edit atau tambah // eslint-disable-line
const isEdit = ref(false)

// State untuk ganti password // eslint-disable-line
const gantiPassword = ref(false)

// Data staff yang sedang diubah atau ditambahkan // eslint-disable-line
const staffEdit = ref({
  nama_staff: '',
  nomor_telp_staff: '',
  alamat_staff: '',
  username_staff: '',
  password_staff: '',
  role_id: null,
})

// Data staff sebelum diedit, digunakan untuk mengecek perubahan // eslint-disable-line
const staffEditBefore = ref(null)

// Daftar role yang tersedia, untuk dropdown select role // eslint-disable-line
const roleOptions = ref([])

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
  { key: 'nama_staff', label: 'Nama', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'nomor_telp_staff', label: 'Telp', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'alamat_staff', label: 'Alamat', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'username_staff', label: 'Username', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'nama_role', label: 'Role', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'actions', label: 'Action', thClass: 'text-center', tdClass: 'text-center' },
]

// Referensi ke form dalam modal // eslint-disable-line
const formStaff = ref(null)

// Fungsi untuk mengambil data staff dari API // eslint-disable-line
async function fetchStaff() {
  const token = sessionStorage.getItem('token')
  try {
    const res = await axios.get('/staff', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: currentPage.value,
        per_page: perPage.value,
        search: search.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
      },
    })
    staff.value = res.data.data
    totalRows.value = res.data.pagination.total
  } catch (error) {
    toastErr(error)
  }
}

// Memantau perubahan filter & sorting untuk refresh data otomatis // eslint-disable-line
watch([currentPage, perPage, search, sortBy, sortDir], () => {
  currentPage.value = currentPage.value < 1 ? 1 : currentPage.value
  fetchStaff()
})

// Reset halaman ke 1 jika perPage atau search berubah // eslint-disable-line
watch([perPage, search], () => {
  currentPage.value = 1
})

// Saat komponen pertama kali dimuat, ambil data staff dan role // eslint-disable-line
onMounted(async () => {
  const token = sessionStorage.getItem('token')
  try {
    await fetchStaff()
    const roleRes = await axios.get('/role', {
      headers: { Authorization: `Bearer ${token}` },
    })
    roleOptions.value = roleRes.data.data.map((r) => ({
      value: r.id_role,
      text: r.nama_role,
    }))
  } catch (err) {
    toastErr(err)
  }
})

// Reset form staff (digunakan saat menutup form/modal) // eslint-disable-line
function resetForm() {
  staffEdit.value = {
    nama_staff: '',
    nomor_telp_staff: '',
    alamat_staff: '',
    username_staff: '',
    password_staff: '',
    role_id: null,
  }
  staffEditBefore.value = null
  isEdit.value = false
  gantiPassword.value = false
}

// Membuka form modal untuk tambah data // eslint-disable-line
function openFormTambah() {
  resetForm()
  showFormStaff.value = true
}

// Membuka form modal untuk edit data, dan simpan data awal // eslint-disable-line
function onEdit(item) {
  staffEdit.value = { ...item, password_staff: '' }
  staffEditBefore.value = { ...item, password_staff: '' }
  isEdit.value = true
  showFormStaff.value = true
}

// Mengecek apakah ada data yang berubah (digunakan sebelum update) // eslint-disable-line
function isDataChanged(before, after) {
  const keys = ['nama_staff', 'nomor_telp_staff', 'alamat_staff', 'username_staff', 'role_id']
  return (
    keys.some((key) => before[key] !== after[key]) ||
    (after.password_staff && after.password_staff !== '')
  )
}

// Menyimpan data staff (baik tambah baru maupun edit) // eslint-disable-line
async function simpanStaff() {
  const form = formStaff.value
  if (form && !form.checkValidity()) {
    form.reportValidity()
    return
  }

  loadingSimpan.value = true
  const token = sessionStorage.getItem('token')

  if (isEdit.value) {
    const dataToSend = { ...staffEdit.value }
    // hanya kirim password jika gantiPassword dicentang dan tidak kosong
    if (!gantiPassword.value || !dataToSend.password_staff) {
      delete dataToSend.password_staff
    }

    if (!isDataChanged(staffEditBefore.value, staffEdit.value)) {
      toast.info('Tidak ada data yang diubah')
      showFormStaff.value = false
      loadingSimpan.value = false
      return
    }

    try {
      const res = await axios.put(`/staff/${dataToSend.id_staff}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toastRes(res)
      showFormStaff.value = false
      fetchStaff()
    } catch (error) {
      toastErr(error)
    } finally {
      loadingSimpan.value = false
    }
  } else {
    try {
      const res = await axios.post('/staff', staffEdit.value, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toastRes(res)
      showFormStaff.value = false
      fetchStaff()
    } catch (error) {
      toastErr(error)
    } finally {
      loadingSimpan.value = false
    }
  }
}

// Menyimpan data staff yang akan dihapus dan membuka modal konfirmasi // eslint-disable-line
function onDelete(item) {
  staffDihapus.value = item
  showKonfirmasiHapus.value = true
}

// Menghapus data staff dari server // eslint-disable-line
async function hapusStaff() {
  const token = sessionStorage.getItem('token')
  try {
    const res = await axios.delete(`/staff/${staffDihapus.value.id_staff}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    toastRes(res)
    showKonfirmasiHapus.value = false
    fetchStaff()
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

function hanyaAngka(event) {
  event.target.value = event.target.value.replace(/\D/g, '')
  staffEdit.value.nomor_telp_staff = event.target.value
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
