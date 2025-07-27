<template>
  <div class="container py-5">
    <h2 class="fw-bold mb-4">Data Pengadaan Stok</h2>
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
          <!-- Tombol tambah data pengadaan stok -->
          <b-button
            title="Tambah Data Pengadaan Stok"
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

      <!-- Tabel Data -->
      <b-table bordered striped hover :items="pengadaan" :fields="fields" responsive>
        <!-- Header custom untuk sorting -->
        <template #head(nama_supplier)>
          <th @click="changeSort('nama_supplier')" style="cursor: pointer">
            Nama<span v-if="sortBy === 'nama_supplier'">{{ sortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(nomor_invoice_pengadaan_stok)>
          <th @click="changeSort('nomor_invoice_pengadaan_stok')" style="cursor: pointer">
            Invoice<span v-if="sortBy === 'nomor_invoice_pengadaan_stok'">{{
              sortDir === 'asc' ? ' ▲' : ' ▼'
            }}</span>
          </th>
        </template>

        <template #head(waktu_pengadaan_stok)>
          <th @click="changeSort('waktu_pengadaan_stok')" style="cursor: pointer">
            Tanggal<span v-if="sortBy === 'waktu_pengadaan_stok'">{{
              sortDir === 'asc' ? ' ▲' : ' ▼'
            }}</span>
          </th>
        </template>

        <template #head(total_harga_pengadaan_stok)>
          <th @click="changeSort('total_harga_pengadaan_stok')" style="cursor: pointer">
            Total<span v-if="sortBy === 'total_harga_pengadaan_stok'">{{
              sortDir === 'asc' ? ' ▲' : ' ▼'
            }}</span>
          </th>
        </template>

        <!-- tampilkan Rupiah pada kolom harga -->
        <template #cell(total_harga_pengadaan_stok)="row">
          <FormatRupiah :value="Number(row.item.total_harga_pengadaan_stok)" />
        </template>

        <!-- Nomor urut data -->
        <template #cell(index)="row">
          <div class="text-center">{{ row.index + 1 + (currentPage - 1) * perPage }}</div>
        </template>

        <!-- Tombol aksi cetak,detail,edit & hapus -->
        <template #cell(actions)="row">
          <div class="d-flex justify-content-center gap-2">
            <!-- Tombol Cetak Invoice -->
            <b-button
              title="Cetak Invoice"
              size="sm"
              variant="light"
              style="
                background-color: #bbf7d0;
                color: #166534;
                border: none;
                border-radius: 6px;
                padding: 4px 8px;
              "
              @click="konfirmasiCetakInvoice(row.item)"
            >
              <i class="bi bi-printer"></i>
            </b-button>

            <!-- Tombol Detail -->
            <b-button
              title="Lihat Data Detail Pengadaan Stok"
              size="sm"
              variant="light"
              style="
                background-color: #93c5fd;
                color: #1e3a8a;
                border: none;
                border-radius: 6px;
                padding: 4px 8px;
              "
              @click="onDetail(row.item)"
            >
              <i class="bi bi-card-list"></i>
            </b-button>

            <!-- Tombol Edit -->
            <b-button
              v-if="false"
              title="Edit Data Pengadaan Stok"
              size="sm"
              variant="light"
              style="
                background-color: #facc15; /* soft yellow */
                color: #1f2937;
                border: none;
                border-radius: 6px;
                padding: 4px 8px;
              "
              @click="onEdit(row.item)"
            >
              <i class="bi bi-pencil"></i>
            </b-button>

            <!-- Tombol Hapus -->
            <b-button
              title="Hapus Data Pengadaan Stok"
              size="sm"
              variant="light"
              style="
                background-color: #f87171; /* soft red */
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

    <!-- Modal Detail Pengadaan Stok -->
    <b-modal
      v-model="showDetail"
      title="Detail Pengadaan Stok"
      size="lg"
      no-footer
      centered
      title-class="text-center w-100 fw-bold"
    >
      <!-- Atur jumlah data per halaman -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <b-form-select v-model="detailPerPage" :options="perPageOptions" class="w-auto" />
        <!-- Pencarian Detail Pengadaan Stok -->
        <div class="search-wrapper d-flex align-items-center" style="max-width: 250px">
          <input
            v-model="detailSearch"
            type="text"
            class="form-control border-bottom p-2"
            placeholder="Search"
          />
          <i class="bi bi-search ms-2" style="font-size: 1.2rem; color: #666"></i>
        </div>
      </div>

      <!-- Tabel Data Detail Pengadaan Stok -->
      <b-table bordered striped hover :items="detailPengadaan" :fields="detailFields" responsive>
        <!-- Header custom untuk sorting -->
        <template #head(nama_produk)>
          <th @click="changeDetailSort('nama_produk')" style="cursor: pointer">
            Produk
            <span v-if="detailSortBy === 'nama_produk'">
              {{ detailSortDir === 'asc' ? ' ▲' : ' ▼' }}
            </span>
          </th>
        </template>

        <template #head(jumlah_produk_detail_pengadaan_stok)>
          <th
            @click="changeDetailSort('jumlah_produk_detail_pengadaan_stok')"
            style="cursor: pointer"
          >
            Jumlah
            <span v-if="detailSortBy === 'jumlah_produk_detail_pengadaan_stok'">{{
              detailSortDir === 'asc' ? ' ▲' : ' ▼'
            }}</span>
          </th>
        </template>

        <template #head(harga_produk_detail_pengadaan_stok)>
          <th
            @click="changeDetailSort('harga_produk_detail_pengadaan_stok')"
            style="cursor: pointer"
          >
            Harga Pengadaan
            <span v-if="detailSortBy === 'harga_produk_detail_pengadaan_stok'">{{
              detailSortDir === 'asc' ? ' ▲' : ' ▼'
            }}</span>
          </th>
        </template>

        <template #head(subtotal_produk_detail_pengadaan_stok)>
          <th
            @click="changeDetailSort('subtotal_produk_detail_pengadaan_stok')"
            style="cursor: pointer"
          >
            Subtotal
            <span v-if="detailSortBy === 'subtotal_produk_detail_pengadaan_stok'">{{
              detailSortDir === 'asc' ? ' ▲' : ' ▼'
            }}</span>
          </th>
        </template>

        <!-- Nomor urut data -->
        <template #cell(index)="row">
          <div class="text-center">
            {{ row.index + 1 + (detailCurrentPage - 1) * detailPerPage }}
          </div>
        </template>

        <!-- tampilkan Rupiah pada kolom harga -->
        <template #cell(harga_produk_detail_pengadaan_stok)="row">
          <FormatRupiah :value="Number(row.item.harga_produk_detail_pengadaan_stok)" />
        </template>

        <template #cell(subtotal_produk_detail_pengadaan_stok)="row">
          <FormatRupiah :value="Number(row.item.subtotal_produk_detail_pengadaan_stok)" />
        </template>
      </b-table>

      <!-- Pagination -->
      <b-pagination
        v-model="detailCurrentPage"
        :total-rows="detailTotalRows"
        :per-page="detailPerPage"
        align="center"
        class="mt-3"
      />
    </b-modal>

    <!-- Modal Tambah/Edit Pengadaan Stok -->
    <b-modal
      v-model="showFormPengadaan"
      :title="isEdit ? 'Edit Pengadaan Stok' : 'Tambah Pengadaan Stok'"
      ok-title="Simpan"
      cancel-title="Batal"
      @ok.prevent="simpanPengadaan"
      :ok-disabled="loadingSimpan"
      :cancel-disabled="loadingSimpan"
      centered
      @hidden="resetForm"
      size="xl"
      title-class="fw-bold text-center w-100"
      footer-class="d-flex justify-content-between"
    >
      <form ref="formPengadaan">
        <b-row class="mb-3 align-items-center">
          <!-- Supplier -->
          <b-col sm="6">
            <b-row class="align-items-center">
              <b-col sm="4">
                <label class="form-label mb-0">Supplier <span class="text-danger">*</span></label>
              </b-col>
              <b-col sm="8">
                <b-form-select
                  v-model="pengadaanEdit.supplier_id"
                  :options="supplierOptions"
                  required
                  size="sm"
                >
                  <!-- pilihan awal -->
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      -- Pilih Supplier --
                    </b-form-select-option>
                  </template>
                </b-form-select>
              </b-col>
            </b-row>
          </b-col>

          <!-- Tanggal Pengadaan -->
          <b-col sm="6">
            <b-row class="align-items-center">
              <b-col sm="5">
                <label class="form-label mb-0"
                  >Tanggal Pengadaan <span class="text-danger">*</span></label
                >
              </b-col>
              <b-col sm="7">
                <b-form-input
                  type="date"
                  v-model="pengadaanEdit.waktu_pengadaan_stok"
                  required
                  size="sm"
                />
              </b-col>
            </b-row>
          </b-col>
        </b-row>

        <!-- Tabel Produk -->
        <b-row class="mb-3">
          <b-col>
            <b-table
              :items="pengadaanEdit.detail"
              :fields="pengadaanFields"
              small
              bordered
              responsive
            >
              <!-- Nomor urut data -->
              <template #cell(index)="row">
                <div class="text-center">
                  {{ row.index + 1 }}
                </div>
              </template>

              <!-- produk -->
              <template #cell(nama_produk)="row">
                <b-form-select
                  v-model="row.item.produk_id"
                  :options="getFilteredProdukOptions(row.item.produk_id)"
                  required
                  size="sm"
                  style="border: none; background-color: transparent; box-shadow: none"
                >
                  <!-- pilihan awal -->
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      -- Pilih Produk --
                    </b-form-select-option>
                  </template>
                </b-form-select>
              </template>

              <!-- harga pengadaan -->
              <template #cell(harga_produk_detail_pengadaan_stok)="row">
                <b-input-group size="sm">
                  <template #prepend>
                    <span class="input-group-text border-0 bg-transparent text-dark"> Rp. </span>
                  </template>
                  <b-form-input
                    type="number"
                    v-model.number="row.item.harga_produk_detail_pengadaan_stok"
                    @input="updateSubtotal(row.index)"
                    :min="1"
                    :max="999999999999999999"
                    step="1"
                    required
                    style="border: none; background-color: transparent; box-shadow: none"
                  />
                </b-input-group>
              </template>

              <!-- jumlah pengadaan -->
              <template #cell(jumlah_produk_detail_pengadaan_stok)="row">
                <b-form-input
                  type="number"
                  v-model.number="row.item.jumlah_produk_detail_pengadaan_stok"
                  @input="updateSubtotal(row.index)"
                  size="sm"
                  :min="1"
                  :max="2147483647"
                  step="1"
                  required
                  style="border: none; background-color: transparent; box-shadow: none"
                />
              </template>

              <!-- tampilkan Rupiah pada kolom harga -->
              <template #cell(subtotal_produk_detail_pengadaan_stok)="row">
                Rp {{ row.item.subtotal_produk_detail_pengadaan_stok.toLocaleString() }}
              </template>

              <!-- Tombol hapus produk -->
              <template #cell(actions)="row">
                <b-button
                  title="Hapus Produk"
                  size="sm"
                  variant="light"
                  style="
                    background-color: #fecaca;
                    color: #991b1b;
                    border: none;
                    border-radius: 6px;
                    padding: 4px 8px;
                  "
                  @click="hapusDetail(row.index)"
                >
                  <i class="bi bi-x-lg"></i>
                </b-button>
              </template>
            </b-table>
            <!-- Tombol tambah produk -->
            <b-button
              title="Tambah Produk"
              size="sm"
              style="
                background-color: #bfdbfe;
                color: #1d4ed8;
                border: none;
                border-radius: 6px;
                padding: 4px 8px;
              "
              class="mt-2"
              @click="tambahDetail"
            >
              <i class="bi bi-plus-lg"></i> Tambah Produk
            </b-button>
          </b-col>
        </b-row>

        <!-- Total Harga -->
        <b-row class="mt-3">
          <b-col class="text-end">
            <strong>Total Harga:</strong> Rp {{ totalHarga.toLocaleString() }}
          </b-col>
        </b-row>
      </form>
    </b-modal>

    <!-- Modal Konfirmasi Hapus -->
    <b-modal
      v-model="showKonfirmasiHapus"
      title="Konfirmasi Hapus"
      @ok="hapusPengadaan"
      ok-title="Hapus"
      cancel-title="Tidak"
      ok-variant="danger"
      :ok-disabled="loadingSimpan"
      :cancel-disabled="loadingSimpan"
      centered
      title-class="fw-bold text-center w-100"
      footer-class="d-flex justify-content-between flex-row-reverse"
    >
      <div>
        Apakah Anda yakin ingin menghapus data
        <strong>{{ pengadaanDihapus?.nomor_invoice_pengadaan_stok }}</strong
        >?
      </div>
    </b-modal>

    <!-- Modal Konfirmasi Cetak Invoice -->
    <b-modal
      v-model="showKonfirmasiCetak"
      title="Cetak Invoice"
      @ok="() => cetakInvoice({ id_pengadaan_stok: pengadaanStokBaruId })"
      ok-title="Cetak"
      cancel-title="Tidak"
      ok-variant="primary"
      centered
      title-class="fw-bold text-center w-100"
      footer-class="d-flex justify-content-between"
    >
      <div class="text-center">
        {{ pesanKonfirmasiCetak }}
      </div>
    </b-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive, computed } from 'vue'
import axios from 'axios'
import FormatRupiah from '@/components/FormatRupiah.vue'
import { toastRes, toastErr } from '@/helpers/toast'
import { useToast } from 'vue-toastification'

const toast = useToast()

const showKonfirmasiCetak = ref(false)
const pengadaanStokBaruId = ref(null)
const pesanKonfirmasiCetak = ref('')

// Data utama
const pengadaan = ref([])
const search = ref('')
const perPage = ref(5)
const currentPage = ref(1)
const totalRows = ref(0)
const sortBy = ref('waktu_pengadaan_stok')
const sortDir = ref('desc')

// State modal detail
const showDetail = ref(false)
const detailPengadaan = ref([])
const detailSearch = ref('')
const detailPerPage = ref(5)
const detailCurrentPage = ref(1)
const detailTotalRows = ref(0)
const detailSortBy = ref('nama_produk') // berdasarkan nama_produk di relasi produk
const detailSortDir = ref('asc')
const currentPengadaanId = ref(null)

// Daftar dropdown // eslint-disable-line
const supplierOptions = ref([])
const produkOptions = ref([])

// Modal Hapus
const showKonfirmasiHapus = ref(false)
const pengadaanDihapus = ref(null)
const loadingSimpan = ref(false)

// tambah/edit
const formPengadaan = ref(null)
const showFormPengadaan = ref(false)
const isEdit = ref(false)
const pengadaanEditBefore = reactive({
  supplier_id: null,
  staff_id: null,
  waktu_pengadaan_stok: '',
  total_harga_pengadaan_stok: '',
  detail: [
    {
      produk_id: null,
      harga_produk_detail_pengadaan_stok: 0,
      jumlah_produk_detail_pengadaan_stok: 0,
      subtotal_produk_detail_pengadaan_stok: 0,
    },
  ],
})
const pengadaanEdit = reactive({
  supplier_id: null,
  staff_id: null,
  waktu_pengadaan_stok: '',
  total_harga_pengadaan_stok: '',
  detail: [
    {
      produk_id: null,
      harga_produk_detail_pengadaan_stok: 0,
      jumlah_produk_detail_pengadaan_stok: 0,
      subtotal_produk_detail_pengadaan_stok: 0,
    },
  ],
})

// Reset form staff (digunakan saat menutup form/modal) // eslint-disable-line
function resetForm() {
  pengadaanEdit.supplier_id = null
  pengadaanEdit.staff_id = null
  pengadaanEdit.waktu_pengadaan_stok = ''
  pengadaanEdit.total_harga_pengadaan_stok = ''
  pengadaanEdit.detail = [
    {
      produk_id: null,

      harga_produk_detail_pengadaan_stok: 0,
      jumlah_produk_detail_pengadaan_stok: 0,
      subtotal_produk_detail_pengadaan_stok: 0,
    },
  ]
  pengadaanEditBefore.value = null
  isEdit.value = false
}

// Field Tabel
const fields = [
  { key: 'index', label: 'No', thClass: 'text-center', tdClass: 'text-center' },
  {
    key: 'nomor_invoice_pengadaan_stok',
    label: 'Invoice',
    thClass: 'text-center',
    tdClass: 'text-start',
  },
  { key: 'nama_supplier', label: 'Nama', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'waktu_pengadaan_stok', label: 'Tanggal', thClass: 'text-center', tdClass: 'text-start' },
  {
    key: 'total_harga_pengadaan_stok',
    label: 'Total',
    thClass: 'text-center',
    tdClass: 'text-start',
  },
  { key: 'actions', label: 'Action', thClass: 'text-center', tdClass: 'text-center' },
]

const perPageOptions = [
  { value: 5, text: '5' },
  { value: 10, text: '10' },
  { value: 15, text: '15' },
  { value: 20, text: '20' },
]

// Field tabel detail
const detailFields = [
  { key: 'index', label: 'No', thClass: 'text-center', tdClass: 'text-center' },
  { key: 'nama_produk', label: 'Produk', thClass: 'text-center', tdClass: 'text-start' },
  {
    key: 'jumlah_produk_detail_pengadaan_stok',
    label: 'Jumlah',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
  {
    key: 'harga_produk_detail_pengadaan_stok',
    label: 'Harga Pengadaan',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
  {
    key: 'subtotal_produk_detail_pengadaan_stok',
    label: 'Total',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
]

// Field tabel input detail
const pengadaanFields = [
  { key: 'index', label: 'No', thClass: 'text-center', tdClass: 'text-center' },
  { key: 'nama_produk', label: 'Produk', thClass: 'text-center', tdClass: 'text-start' },
  {
    key: 'jumlah_produk_detail_pengadaan_stok',
    label: 'Jumlah',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
  {
    key: 'harga_produk_detail_pengadaan_stok',
    label: 'Harga Pengadaan',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
  {
    key: 'subtotal_produk_detail_pengadaan_stok',
    label: 'Subtotal',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
  { key: 'actions', label: 'Action', thClass: 'text-center', tdClass: 'text-center' },
]

// Fungsi ambil detail
async function fetchDetail(id) {
  const token = sessionStorage.getItem('token')
  if (!id) {
    console.warn('ID pengadaan tidak valid saat fetchDetail dipanggil')
    return
  }
  try {
    const res = await axios.get(`/pengadaan-stok/${id}/detail`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: detailCurrentPage.value,
        per_page: detailPerPage.value,
        search: detailSearch.value,
        sort_by: detailSortBy.value,
        sort_order: detailSortDir.value,
      },
    })
    detailPengadaan.value = res.data.data.map((item) => ({
      ...item,
      nama_produk: item.produk?.nama_produk || '',
    }))
    detailTotalRows.value = res.data.meta.total
  } catch (error) {
    toastErr(error)
  }
}

// Buka modal detail dari icon
function onDetail(item) {
  detailCurrentPage.value = 1
  detailSearch.value = ''
  detailSortBy.value = 'nama_produk'
  detailSortDir.value = 'asc'
  showDetail.value = true
  currentPengadaanId.value = item.id_pengadaan_stok
  fetchDetail(currentPengadaanId.value)
}

// Sorting detail
function changeDetailSort(field) {
  if (detailSortBy.value === field) {
    detailSortDir.value = detailSortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    detailSortBy.value = field
    detailSortDir.value = 'asc'
  }
}

// Ambil data
async function fetchPengadaan() {
  const token = sessionStorage.getItem('token')
  try {
    const res = await axios.get('/pengadaan-stok', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: currentPage.value,
        per_page: perPage.value,
        search: search.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
      },
    })
    pengadaan.value = res.data.data
    totalRows.value = res.data.pagination.total
  } catch (error) {
    toastErr(error)
  }
}

// Hapus
function onDelete(item) {
  pengadaanDihapus.value = item
  showKonfirmasiHapus.value = true
}

async function hapusPengadaan() {
  const token = sessionStorage.getItem('token')
  try {
    const res = await axios.delete(`/pengadaan-stok/${pengadaanDihapus.value.id_pengadaan_stok}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    toastRes(res)
    showKonfirmasiHapus.value = false
    await fetchPengadaan()
    await fetchProduk()
  } catch (error) {
    toastErr(error)
  }
}

// Sorting
function changeSort(field) {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortDir.value = 'asc'
  }
}

// Memantau perubahan filter & sorting untuk refresh data otomatis // eslint-disable-line
watch([currentPage, perPage, search, sortBy, sortDir], () => {
  currentPage.value = currentPage.value < 1 ? 1 : currentPage.value
  fetchPengadaan()
})

// Reset halaman ke 1 jika perPage atau search berubah // eslint-disable-line
watch([perPage, search], () => {
  currentPage.value = 1
})

// Watcher untuk refresh data detail jika search, pagination, sort berubah
watch([detailCurrentPage, detailPerPage, detailSearch, detailSortBy, detailSortDir], () => {
  if (showDetail.value && currentPengadaanId.value) {
    fetchDetail(currentPengadaanId.value)
  }
})

//ambil data produk
async function fetchProduk() {
  const token = sessionStorage.getItem('token')
  try {
    const produkRes = await axios.get('/produk/dropdown', {
      headers: { Authorization: `Bearer ${token}` },
    })
    produkOptions.value = produkRes.data.data.map((p) => ({
      value: p.id_produk,
      text: `${p.nama_produk} (Stok: ${p.stok_produk})`,
    }))
  } catch (err) {
    toastErr(err)
  }
}

// Saat komponen pertama kali dimuat, ambil data staff dan role // eslint-disable-line
onMounted(async () => {
  const token = sessionStorage.getItem('token')

  // Ambil data pengadaan
  try {
    await fetchPengadaan()
  } catch (err) {
    toastErr(err)
  }
  // Ambil data supplier
  try {
    const supplierRes = await axios.get('/supplier/dropdown', {
      headers: { Authorization: `Bearer ${token}` },
    })
    supplierOptions.value = supplierRes.data.data.map((s) => ({
      value: s.id_supplier,
      text: s.nama_supplier,
    }))
  } catch (err) {
    toastErr(err)
  }
  // Ambil data produk
  try {
    await fetchProduk()
  } catch (err) {
    toastErr(err)
  }
})

function tambahDetail() {
  pengadaanEdit.detail.push({
    produk_id: null,

    harga_produk_detail_pengadaan_stok: 0,
    jumlah_produk_detail_pengadaan_stok: 0,
    subtotal_produk_detail_pengadaan_stok: 0,
  })
}

function hapusDetail(index) {
  pengadaanEdit.detail.splice(index, 1)
  updateTotalHarga()
}

const totalHarga = computed(() => {
  return pengadaanEdit.detail.reduce((total, item) => {
    return (
      total +
      (item.harga_produk_detail_pengadaan_stok || 0) *
        (item.jumlah_produk_detail_pengadaan_stok || 0)
    )
  }, 0)
})

function updateTotalHarga() {
  pengadaanEdit.total_harga_pengadaan_stok = totalHarga.value
}

function updateSubtotal(index) {
  const item = pengadaanEdit.detail[index]
  item.subtotal_produk_detail_pengadaan_stok =
    (item.harga_produk_detail_pengadaan_stok || 0) * (item.jumlah_produk_detail_pengadaan_stok || 0)
  updateTotalHarga()
}

// Membuka form modal untuk tambah data // eslint-disable-line
function openFormTambah() {
  resetForm()
  showFormPengadaan.value = true
}

function isDataChanged(before, after) {
  const keysUtama = [
    'supplier_id',
    'staff_id',
    'waktu_pengadaan_stok',
    'total_harga_pengadaan_stok',
  ]
  const utamaBerubah = keysUtama.some((key) => before[key] !== after[key])

  if (utamaBerubah) return true

  if (before.detail.length !== after.detail.length) return true

  for (let i = 0; i < before.detail.length; i++) {
    const b = before.detail[i]
    const a = after.detail[i]
    const keysDetail = [
      'produk_id',
      'harga_produk_detail_pengadaan_stok',
      'jumlah_produk_detail_pengadaan_stok',
      'subtotal_produk_detail_pengadaan_stok',
    ]
    const detailBerubah = keysDetail.some((key) => b[key] !== a[key])
    if (detailBerubah) return true
  }

  return false
}

async function onEdit(item) {
  try {
    // Panggil API show untuk ambil data lengkap parent + detail
    const response = await axios.get(`/pengadaan-stok/${item.id_pengadaan_stok}`)
    const data = response.data.data

    // Assign data parent
    Object.assign(pengadaanEdit, {
      id_pengadaan_stok: data.id_pengadaan_stok,
      supplier_id: data.supplier_id,
      staff_id: data.staff_id,
      waktu_pengadaan_stok: data.waktu_pengadaan_stok,
      total_harga_pengadaan_stok: data.total_harga_pengadaan_stok,
      // Salin detail-nya
      detail: (data.detail_pengadaan_stok || []).map((d) => ({ ...d })),
    })

    Object.assign(pengadaanEditBefore, JSON.parse(JSON.stringify(pengadaanEdit))) // deep copy
    isEdit.value = true
    showFormPengadaan.value = true
  } catch (error) {
    console.error('Gagal ambil data pengadaan:', error)
    // Tampilkan pesan error jika perlu
  }
}

async function simpanPengadaan() {
  const form = formPengadaan.value
  if (form && !form.checkValidity()) {
    form.reportValidity()
    return
  }

  loadingSimpan.value = true
  const token = sessionStorage.getItem('token')
  const idStaff = sessionStorage.getItem('id_staff')

  pengadaanEdit.staff_id = parseInt(idStaff) // isi otomatis dari session

  const dataToSend = {
    ...pengadaanEdit,
    detail: pengadaanEdit.detail.map((item) => {
      const cleanedItem = { ...item }
      delete cleanedItem.subtotal_produk_detail_pengadaan_stok
      delete cleanedItem.produk
      delete cleanedItem.created_at
      return cleanedItem
    }),
  }
  delete dataToSend.total_harga_pengadaan_stok

  if (isEdit.value) {
    if (!isDataChanged(pengadaanEditBefore, pengadaanEdit)) {
      toast.info('Tidak ada data yang diubah')
      showFormPengadaan.value = false
      loadingSimpan.value = false
      return
    }

    try {
      const response = await axios.put(
        `/pengadaan-stok/${dataToSend.id_pengadaan_stok}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      )
      toastRes(response)
      showFormPengadaan.value = false
      await fetchProduk()
      await fetchPengadaan()
    } catch (error) {
      toastErr(error)
    } finally {
      loadingSimpan.value = false
    }
  } else {
    try {
      const res = await axios.post('/pengadaan-stok', dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      toastRes(res)
      const id_pengadaan_stok_baru = res.data.id_pengadaan_stok // ✅ Ambil ID dari response
      // Simpan ke state untuk cetak
      pengadaanStokBaruId.value = id_pengadaan_stok_baru
      pesanKonfirmasiCetak.value =
        'Pengadaan Stok berhasil disimpan. Apakah Anda ingin mencetak invoice sekarang?'
      showKonfirmasiCetak.value = true
      showFormPengadaan.value = false
      await fetchProduk()
      await fetchPengadaan()
    } catch (error) {
      toastErr(error)
    } finally {
      loadingSimpan.value = false
    }
  }
}

function getFilteredProdukOptions(selectedId) {
  return produkOptions.value.filter((option) => {
    return (
      option.value === selectedId ||
      !pengadaanEdit.detail.some(
        (item) => item.produk_id === option.value && option.value !== selectedId,
      )
    )
  })
}

const konfirmasiCetakInvoice = (item) => {
  pengadaanStokBaruId.value = item.id_pengadaan_stok
  pesanKonfirmasiCetak.value =
    pesanKonfirmasiCetak.value = `Apakah Anda yakin ingin mencetak invoice untuk pengadaan stok dengan No. ${item.nomor_invoice_pengadaan_stok || item.id_pengadaan_stok}?`
  showKonfirmasiCetak.value = true
}

async function cetakInvoice(item) {
  const token = sessionStorage.getItem('token')
  if (!item?.id_pengadaan_stok) return

  try {
    const response = await axios.get(`/pengadaan-stok/${item.id_pengadaan_stok}/invoice`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
  } catch (err) {
    toast.error('Gagal membuka invoice PDF.')
    console.error(err)
  }
}
</script>

<style scoped>
.search-wrapper input {
  border: none;
  outline: none;
  padding: 6px 8px;
}
</style>
