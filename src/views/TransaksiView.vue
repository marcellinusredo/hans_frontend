<template>
  <div class="container py-5">
    <h2 class="fw-bold mb-4">Data Transaksi</h2>
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
          <!-- Tombol tambah data transaksi -->
          <b-button
            title="Tambah Data Transaksi"
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
      <b-table bordered striped hover :items="transaksi" :fields="fields" responsive>
        <!-- Header custom untuk sorting -->
        <template #head(nama_pelanggan)>
          <th @click="changeSort('nama_pelanggan')" style="cursor: pointer">
            Nama<span v-if="sortBy === 'nama_pelanggan'">{{
              sortDir === 'asc' ? ' ▲' : ' ▼'
            }}</span>
          </th>
        </template>

        <template #head(nomor_invoice_transaksi)>
          <th @click="changeSort('nomor_invoice_transaksi')" style="cursor: pointer">
            Invoice<span v-if="sortBy === 'nomor_invoice_transaksi'">{{
              sortDir === 'asc' ? ' ▲' : ' ▼'
            }}</span>
          </th>
        </template>

        <template #head(waktu_transaksi)>
          <th @click="changeSort('waktu_transaksi')" style="cursor: pointer">
            Tanggal<span v-if="sortBy === 'waktu_transaksi'">{{
              sortDir === 'asc' ? ' ▲' : ' ▼'
            }}</span>
          </th>
        </template>

        <template #head(total_harga_transaksi)>
          <th @click="changeSort('total_harga_transaksi')" style="cursor: pointer">
            Total<span v-if="sortBy === 'total_harga_transaksi'">{{
              sortDir === 'asc' ? ' ▲' : ' ▼'
            }}</span>
          </th>
        </template>

        <!-- Nomor urut data -->
        <template #cell(index)="row">
          <div class="text-center">{{ row.index + 1 + (currentPage - 1) * perPage }}</div>
        </template>

        <!-- tampilkan Rupiah pada kolom harga -->
        <template #cell(total_harga_transaksi)="row">
          <FormatRupiah :value="Number(row.item.total_harga_transaksi)" />
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
              title="lihat Data Detail Transaksi"
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
              title="Edit Data Transaksi"
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
              title="Hapus Data Transaksi"
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

    <!-- Modal Detail Transaksi -->
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
        <!-- Pencarian -->
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

      <!-- Tabel Detail Transaksi -->
      <b-table bordered striped hover :items="detailTransaksi" :fields="detailFields" responsive>
        <!-- tampilkan Rupiah pada kolom harga -->
        <template #cell(harga)="row">
          <FormatRupiah :value="Number(row.item.harga)" />
        </template>

        <template #cell(subtotal)="row">
          <FormatRupiah :value="Number(row.item.subtotal)" />
        </template>

        <!-- Nomor urut data -->
        <template #cell(index)="row">
          <div class="text-center">
            {{ row.index + 1 + (detailCurrentPage - 1) * detailPerPage }}
          </div>
        </template>

        <!-- Header custom untuk sorting -->
        <template #head(nama)>
          <th @click="changeDetailSort('nama')" style="cursor: pointer">
            Nama
            <span v-if="detailSortBy === 'nama'">
              {{ detailSortDir === 'asc' ? ' ▲' : ' ▼' }}
            </span>
          </th>
        </template>

        <template #head(jenis)>
          <th @click="changeDetailSort('jenis')" style="cursor: pointer">
            Jenis
            <span v-if="detailSortBy === 'jenis'">{{ detailSortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(kode)>
          <th @click="changeDetailSort('kode')" style="cursor: pointer">
            Kode
            <span v-if="detailSortBy === 'kode'">{{ detailSortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(harga)>
          <th @click="changeDetailSort('harga')" style="cursor: pointer">
            Harga
            <span v-if="detailSortBy === 'harga'">{{ detailSortDir === 'asc' ? ' ▲' : ' ▼' }}</span>
          </th>
        </template>

        <template #head(jumlah)>
          <th @click="changeDetailSort('jumlah')" style="cursor: pointer">
            Jumlah
            <span v-if="detailSortBy === 'jumlah'">{{
              detailSortDir === 'asc' ? ' ▲' : ' ▼'
            }}</span>
          </th>
        </template>

        <template #head(subtotal)>
          <th @click="changeDetailSort('subtotal')" style="cursor: pointer">
            Sub Total
            <span v-if="detailSortBy === 'subtotal'">{{
              detailSortDir === 'asc' ? ' ▲' : ' ▼'
            }}</span>
          </th>
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

    <!-- Modal Tambah/Edit transaksi -->
    <b-modal
      v-model="showFormTransaksi"
      :title="isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'"
      ok-title="Simpan"
      cancel-title="Batal"
      @ok.prevent="simpanTransaksi"
      :ok-disabled="
        loadingSimpan ||
        (!isEdit && transaksiEdit.pembayaran_transaksi < transaksiEdit.total_harga_transaksi) ||
        transaksiEdit.pembayaran_transaksi === 0
      "
      :cancel-disabled="loadingSimpan"
      centered
      @hidden="resetForm"
      @show="aturTampilanSwitch"
      size="xl"
      title-class="fw-bold text-center w-100"
      footer-class="d-flex justify-content-between"
    >
      <form ref="formTransaksi">
        <b-row class="mb-3 align-items-center">
          <!-- Pelanggan -->
          <b-col sm="6">
            <b-row class="align-items-center">
              <b-col sm="4">
                <label class="form-label mb-0">Pelanggan <span class="text-danger">*</span></label>
              </b-col>
              <b-col sm="8">
                <b-form-select
                  v-model="transaksiEdit.pelanggan_id"
                  :options="pelangganOptions"
                  required
                  size="sm"
                >
                  <!-- pilihan awal -->
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      -- Pilih Pelanggan --
                    </b-form-select-option>
                  </template>
                </b-form-select>
              </b-col>
            </b-row>
          </b-col>

          <!-- Tanggal Transaksi -->
          <b-col sm="6">
            <b-row class="align-items-center">
              <b-col sm="5">
                <label class="form-label mb-0"
                  >Tanggal Transaksi <span class="text-danger">*</span></label
                >
              </b-col>
              <b-col sm="7">
                <b-form-input
                  type="date"
                  v-model="transaksiEdit.waktu_transaksi"
                  required
                  size="sm"
                />
              </b-col>
            </b-row>
          </b-col>
        </b-row>

        <!-- Trigger Tabel -->
        <b-row class="mb-3">
          <b-col cols="6">
            <b-form-checkbox v-model="tampilkanProduk" switch size="lg"> Produk </b-form-checkbox>
          </b-col>
          <b-col cols="6">
            <b-form-checkbox v-model="tampilkanJasa" switch size="lg"> Jasa </b-form-checkbox>
          </b-col>
        </b-row>

        <!-- Tabel Produk -->
        <b-row class="mb-3" v-if="tampilkanProduk">
          <b-col>
            <b-table
              :items="transaksiEdit.detail_produk"
              :fields="produkFields"
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
                  @change="onProdukChange(row.item, row.index)"
                  style="border: none; background-color: transparent; box-shadow: none"
                >
                  <template #first>
                    <!-- pilihan awal -->
                    <b-form-select-option :value="null" disabled>
                      -- Pilih Produk --
                    </b-form-select-option>
                  </template>
                </b-form-select>
              </template>

              <!-- Harga produk -->
              <template #cell(harga_produk_detail_transaksi)="row">
                <span
                  class="form-control bg-transparent border-0 px-1"
                  style="pointer-events: none"
                >
                  <FormatRupiah :value="row.item.harga_produk_detail_transaksi" />
                </span>
              </template>

              <!-- Jumlah produk -->
              <template #cell(jumlah_produk_detail_transaksi)="row">
                <b-form-input
                  type="number"
                  v-model.number="row.item.jumlah_produk_detail_transaksi"
                  @input="cekJumlah(row.item, row.index)"
                  size="sm"
                  :min="1"
                  :max="2147483647"
                  step="1"
                  required
                  style="border: none; background-color: transparent; box-shadow: none"
                />
              </template>

              <!-- sub total -->
              <template #cell(subtotal_produk_detail_transaksi)="row">
                <FormatRupiah :value="row.item.subtotal_produk_detail_transaksi" />
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
                  @click="hapusDetailProduk(row.index)"
                >
                  <i class="bi bi-x-lg"></i>
                </b-button>
              </template>
            </b-table>
            <!-- Total dan Tombol -->
            <b-row class="mt-3 align-items-center">
              <b-col cols="6">
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
                  @click="tambahDetailProduk"
                >
                  <i class="bi bi-plus-lg"></i> Tambah Produk
                </b-button>
              </b-col>

              <!--  Total Harga Produk -->
              <b-col cols="6" class="text-end">
                <strong>Total Harga Produk:</strong>
                <FormatRupiah :value="totalHargaProduk" />
              </b-col>
            </b-row>
          </b-col>
        </b-row>

        <!-- Tabel Jasa -->
        <b-row class="mb-3" v-if="tampilkanJasa">
          <b-col>
            <b-table
              :items="transaksiEdit.detail_jasa"
              :fields="jasaFields"
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

              <!-- jasa -->
              <template #cell(nama_jasa)="row">
                <b-form-select
                  v-model="row.item.jasa_id"
                  :options="getFilteredJasaptions(row.item.jasa_id)"
                  required
                  size="sm"
                  @change="onJasaChange(row.item)"
                  style="border: none; background-color: transparent; box-shadow: none"
                >
                  <!-- Pilihan awal -->
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      -- Pilih Jasa --
                    </b-form-select-option>
                  </template>
                </b-form-select>
              </template>

              <!-- Harga jasa -->
              <template #cell(harga_jasa_detail_transaksi_jasa)="row">
                <span
                  class="form-control bg-transparent border-0 px-1"
                  style="pointer-events: none"
                >
                  <FormatRupiah :value="row.item.harga_jasa_detail_transaksi_jasa" />
                </span>
              </template>

              <!-- hapus jasa -->
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
                  @click="hapusDetailJasa(row.index)"
                >
                  <i class="bi bi-x-lg"></i>
                </b-button>
              </template>
            </b-table>

            <!-- Total dan Tombol -->
            <b-row class="mt-3 align-items-center">
              <b-col cols="6">
                <!-- tombool tambah jasa-->
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
                  @click="tambahDetailJasa"
                >
                  <i class="bi bi-plus-lg"></i> Tambah Produk
                </b-button>
              </b-col>

              <!-- Total Harga Jasa -->
              <b-col cols="6" class="text-end">
                <strong>Total Harga Jasa:</strong>
                <FormatRupiah :value="totalHargaJasa" />
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <!-- Komponen Total Harga, Pembayaran, dan Kembalian -->
        <b-row class="mt-3">
          <b-col cols="12" md="6">
            <!-- Total Harga -->
            <b-row class="mb-2 align-items-center">
              <b-col cols="4"><strong>Total Harga</strong></b-col>
              <b-col cols="8">
                <b-input-group>
                  <template #prepend>
                    <span class="input-group-text">Rp.</span>
                  </template>
                  <b-form-input :value="transaksiEdit.total_harga_transaksi" readonly type="text" />
                </b-input-group>
              </b-col>
            </b-row>

            <!-- Pembayaran -->
            <b-row class="mb-2 align-items-center">
              <b-col cols="4"><strong>Pembayaran</strong></b-col>
              <b-col cols="8">
                <b-input-group>
                  <template #prepend>
                    <span class="input-group-text">Rp.</span>
                  </template>
                  <b-form-input
                    v-model.number="transaksiEdit.pembayaran_transaksi"
                    type="number"
                    placeholder="Masukkan pembayaran"
                    :min="1"
                    :max="999999999999999999"
                    step="1"
                  />
                </b-input-group>
              </b-col>
            </b-row>

            <!-- Kembalian -->
            <b-row class="mb-2 align-items-center">
              <b-col cols="4"><strong>Kembalian</strong></b-col>
              <b-col cols="8">
                <b-input-group>
                  <template #prepend>
                    <span class="input-group-text">Rp.</span>
                  </template>
                  <b-form-input v-model="transaksiEdit.kembalian_transaksi" readonly type="text" />
                </b-input-group>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </form>
    </b-modal>

    <!-- Modal Konfirmasi Hapus -->
    <b-modal
      v-model="showKonfirmasiHapus"
      title="Konfirmasi Hapus"
      @ok="hapusTransaksi"
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
        <strong>{{ transaksiDihapus?.nomor_invoice_transaksi }}</strong
        >?
      </div>
    </b-modal>

    <!-- Modal Konfirmasi Cetak Invoice -->
    <b-modal
      v-model="showKonfirmasiCetak"
      title="Cetak Invoice"
      @ok="() => cetakInvoice({ id_transaksi: transaksiBaruId })"
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
import { ref, onMounted, watch, reactive, computed, nextTick } from 'vue'
import axios from 'axios'
import FormatRupiah from '@/components/FormatRupiah.vue'
import { toastRes, toastErr } from '@/helpers/toast'
import { useToast } from 'vue-toastification'

const toast = useToast()

const tampilkanProduk = ref(true)
const tampilkanJasa = ref(true)

const showKonfirmasiCetak = ref(false)
const transaksiBaruId = ref(null)
const pesanKonfirmasiCetak = ref(
  'Transaksi berhasil disimpan. Apakah Anda ingin mencetak invoice sekarang?',
)

// Data utama
const transaksi = ref([])
const search = ref('')
const perPage = ref(5)
const currentPage = ref(1)
const totalRows = ref(0)
const sortBy = ref('waktu_transaksi')
const sortDir = ref('desc')

// State modal detail
const showDetail = ref(false)
const detailTransaksi = ref([])
const detailSearch = ref('')
const detailPerPage = ref(5)
const detailCurrentPage = ref(1)
const detailTotalRows = ref(0)
const detailSortBy = ref('nama')
const detailSortDir = ref('asc')
const currentTransaksiId = ref(null)

// Daftar dropdown // eslint-disable-line
const pelangganOptions = ref([])
const produkOptions = ref([])
const jasaOptions = ref([])

// Modal Hapus
const showKonfirmasiHapus = ref(false)
const transaksiDihapus = ref(null)
const loadingSimpan = ref(false)

// tambah/edit
const formTransaksi = ref(null)
const showFormTransaksi = ref(false)
const isEdit = ref(false)
const transaksiEditBefore = reactive({
  pelanggan_id: null,
  staff_id: null,
  nama_pelanggan: '',
  waktu_transaksi: '',
  total_harga_transaksi: 0,
  pembayaran_transaksi: 0,
  kembalian_transaksi: 0,
  detail_produk: [
    {
      produk_id: null,
      jumlah_produk_detail_transaksi: 0,
      harga_produk_detail_transaksi: 0,
      subtotal_produk_detail_transaksi: 0,
    },
  ],
  detail_jasa: [
    {
      jasa_id: null,
      harga_jasa_detail_transaksi_jasa: 0,
    },
  ],
})
const transaksiEdit = reactive({
  pelanggan_id: null,
  staff_id: null,
  nama_pelanggan: '',
  waktu_transaksi: '',
  total_harga_transaksi: 0,
  pembayaran_transaksi: 0,
  kembalian_transaksi: 0,
  detail_produk: [
    {
      produk_id: null,
      jumlah_produk_detail_transaksi: 0,
      harga_produk_detail_transaksi: 0,
      subtotal_produk_detail_transaksi: 0,
    },
  ],
  detail_jasa: [
    {
      jasa_id: null,
      harga_jasa_detail_transaksi_jasa: 0,
    },
  ],
})

// Reset form staff (digunakan saat menutup form/modal) // eslint-disable-line
function resetForm() {
  transaksiEdit.pelanggan_id = null
  transaksiEdit.staff_id = null
  transaksiEdit.waktu_transaksi = ''
  transaksiEdit.total_harga_transaksi = 0
  transaksiEdit.pembayaran_transaksi = 0
  transaksiEdit.kembalian_transaksi = 0
  ;(transaksiEdit.detail_produk = [
    {
      produk_id: null,
      jumlah_produk_detail_transaksi: 0,
      harga_produk_detail_transaksi: 0,
      subtotal_produk_detail_transaksi: 0,
    },
  ]),
    (transaksiEdit.detail_jasa = [
      {
        jasa_id: null,
        harga_jasa_detail_transaksi_jasa: 0,
      },
    ]),
    (transaksiEditBefore.value = null)
  isEdit.value = false
}

// Field Tabel
const fields = [
  { key: 'index', label: 'No', thClass: 'text-center', tdClass: 'text-center' },
  {
    key: 'nomor_invoice_transaksi',
    label: 'Invoice',
    thClass: 'text-center',
    tdClass: 'text-start',
  },
  { key: 'nama_pelanggan', label: 'Nama', thClass: 'text-center', tdClass: 'text-start' },
  { key: 'waktu_transaksi', label: 'Tanggal', thClass: 'text-center', tdClass: 'text-start' },
  {
    key: 'total_harga_transaksi',
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
  { key: 'nama', label: 'Nama', thClass: 'text-center', tdClass: 'text-start' },
  {
    key: 'jenis',
    label: 'Jenis',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
  {
    key: 'kode',
    label: 'Kode',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
  {
    key: 'harga',
    label: 'Harga',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
  {
    key: 'jumlah',
    label: 'Jumlah',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
  {
    key: 'subtotal',
    label: 'Sub Total',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
]

// Field tabel input produk
const produkFields = [
  { key: 'index', label: 'No', thClass: 'text-center', tdClass: 'text-center' },
  { key: 'nama_produk', label: 'Produk', thClass: 'text-center', tdClass: 'text-start' },
  {
    key: 'harga_produk_detail_transaksi',
    label: 'Harga',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
  {
    key: 'jumlah_produk_detail_transaksi',
    label: 'Jumlah',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
  {
    key: 'subtotal_produk_detail_transaksi',
    label: 'Sub Total',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
  { key: 'actions', label: 'Action', thClass: 'text-center', tdClass: 'text-center' },
]

// Field tabel input produk
const jasaFields = [
  { key: 'index', label: 'No', thClass: 'text-center', tdClass: 'text-center' },
  { key: 'nama_jasa', label: 'Jasa', thClass: 'text-center', tdClass: 'text-start' },
  {
    key: 'harga_jasa_detail_transaksi_jasa',
    label: 'Harga',
    thClass: 'text-center',
    tdClass: 'text-end',
  },
  { key: 'actions', label: 'Action', thClass: 'text-center', tdClass: 'text-center' },
]

// Fungsi ambil detail
async function fetchDetail(id) {
  const token = sessionStorage.getItem('token')
  if (!id) {
    console.warn('ID transaksi tidak valid saat fetchDetail dipanggil')
    return
  }
  try {
    const res = await axios.get(`/transaksi/${id}/detail`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: detailCurrentPage.value,
        per_page: detailPerPage.value,
        search: detailSearch.value,
        sort_by: detailSortBy.value,
        sort_order: detailSortDir.value,
      },
    })
    detailTransaksi.value = res.data.data.map((item) => ({
      ...item,
    }))
    detailTotalRows.value = res.data.pagination.total
  } catch (error) {
    toastErr(error)
  }
}

// Buka modal detail dari icon
function onDetail(item) {
  detailCurrentPage.value = 1
  detailSearch.value = ''
  detailSortBy.value = 'nama'
  detailSortDir.value = 'asc'
  showDetail.value = true
  currentTransaksiId.value = item.id_transaksi
  fetchDetail(currentTransaksiId.value)
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
async function fetchTransaksi() {
  const token = sessionStorage.getItem('token')
  try {
    const res = await axios.get('/transaksi', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: currentPage.value,
        per_page: perPage.value,
        search: search.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
      },
    })
    transaksi.value = res.data.data
    totalRows.value = res.data.pagination.total
  } catch (error) {
    toastErr(error)
  }
}

// Hapus
function onDelete(item) {
  transaksiDihapus.value = item
  showKonfirmasiHapus.value = true
}

async function hapusTransaksi() {
  const token = sessionStorage.getItem('token')
  try {
    const res = await axios.delete(`/transaksi/${transaksiDihapus.value.id_transaksi}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    toastRes(res)
    showKonfirmasiHapus.value = false
    await fetchTransaksi()
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
  fetchTransaksi()
})

// Reset halaman ke 1 jika perPage atau search berubah // eslint-disable-line
watch([perPage, search], () => {
  currentPage.value = 1
})

// Watcher untuk refresh data detail jika search, pagination, sort berubah
watch([detailCurrentPage, detailPerPage, detailSearch, detailSortBy, detailSortDir], () => {
  if (showDetail.value && currentTransaksiId.value) {
    fetchDetail(currentTransaksiId.value)
  }
})

watch(
  () => [transaksiEdit.pembayaran_transaksi, transaksiEdit.total_harga_transaksi],
  () => {
    transaksiEdit.kembalian_transaksi = kembalian.value
  },
)

//ambil data produk
async function fetchProduk() {
  const token = sessionStorage.getItem('token')
  try {
    const produkRes = await axios.get('/produk/dropdown-transaksi', {
      headers: { Authorization: `Bearer ${token}` },
    })
    produkOptions.value = produkRes.data.data.map((p) => ({
      value: p.id_produk,
      text: `${p.nama_produk} (Stok: ${p.stok_produk})`,
      harga: p.harga_produk,
      stok: p.stok_produk,
    }))
  } catch (err) {
    toastErr(err)
  }
}

//ambil data jasa
async function fetchJasa() {
  const token = sessionStorage.getItem('token')
  try {
    const jasaRes = await axios.get('/jasa/dropdown', {
      headers: { Authorization: `Bearer ${token}` },
    })
    jasaOptions.value = jasaRes.data.data.map((j) => ({
      value: j.id_jasa,
      text: j.nama_jasa,
      harga: j.harga_jasa,
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
    await fetchTransaksi()
  } catch (err) {
    toastErr(err)
  }
  // Ambil data pelanggan
  try {
    const pelangganRes = await axios.get('/pelanggan/dropdown', {
      headers: { Authorization: `Bearer ${token}` },
    })
    pelangganOptions.value = pelangganRes.data.data.map((p) => ({
      value: p.id_pelanggan,
      text: p.nama_pelanggan,
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
  // Ambil data jasa
  try {
    await fetchJasa()
  } catch (err) {
    toastErr(err)
  }
})

function tambahDetailProduk() {
  transaksiEdit.detail_produk.push({
    produk_id: null,
    harga_produk_detail_transaksi: 0,
    jumlah_produk_detail_transaksi: 0,
    subtotal_produk_detail_transaksi: 0,
  })
}

function hapusDetailProduk(index) {
  transaksiEdit.detail_produk.splice(index, 1)
  updateTotalHarga()
}

function tambahDetailJasa() {
  transaksiEdit.detail_jasa.push({
    jasa_id: null,
    harga_jasa_detail_transaksi_jasa: 0,
  })
}

function hapusDetailJasa(index) {
  transaksiEdit.detail_jasa.splice(index, 1)
  updateTotalHarga()
}

function updateTotalHarga() {
  transaksiEdit.total_harga_transaksi = totalHargaProduk.value + totalHargaJasa.value
}

function updateSubtotalProduk(index) {
  const item = transaksiEdit.detail_produk[index]
  item.subtotal_produk_detail_transaksi =
    (item.harga_produk_detail_transaksi || 0) * (item.jumlah_produk_detail_transaksi || 0)
  updateTotalHarga()
}

const totalHargaProduk = computed(() => {
  return Array.isArray(transaksiEdit?.detail_produk)
    ? transaksiEdit.detail_produk.reduce((total_produk, item) => {
        return (
          total_produk +
          (item.harga_produk_detail_transaksi || 0) * (item.jumlah_produk_detail_transaksi || 0)
        )
      }, 0)
    : 0
})

const totalHargaJasa = computed(() => {
  return Array.isArray(transaksiEdit?.detail_jasa)
    ? transaksiEdit.detail_jasa.reduce((total_jasa, item) => {
        return total_jasa + Number(item.harga_jasa_detail_transaksi_jasa || 0)
      }, 0)
    : 0
})

const kembalian = computed(() => {
  const bayar = Number(transaksiEdit.pembayaran_transaksi) || 0
  const total = Number(transaksiEdit.total_harga_transaksi) || 0
  return bayar > total ? bayar - total : 0
})

function updateKembalian() {
  transaksiEdit.kembalian_transaksi = kembalian.value
}

// Membuka form modal untuk tambah data // eslint-disable-line
function openFormTambah() {
  resetForm()
  showFormTransaksi.value = true
}

function isDataChanged(before, after) {
  const keysUtama = [
    'supplier_id',
    'staff_id',
    'waktu_pengadaan_stok',
    'total_harga_pengadaan_stok',
    'pembayaran_transaksi',
    'kembalian_transaksi',
  ]
  const utamaBerubah = keysUtama.some((key) => before[key] !== after[key])

  if (utamaBerubah) return true

  if (before.detail_produk.length !== after.detail_produk.length) return true
  if (before.detail_jasa.length !== after.detail_jasa.length) return true

  for (let i = 0; i < before.detail_produk.length; i++) {
    const bp = before.detail_produk[i]
    const ap = after.detail_produk[i]
    const keysDetailProduk = [
      'produk_id',
      'harga_produk_detail_pengadaan_stok',
      'jumlah_produk_detail_pengadaan_stok',
      'subtotal_produk_detail_pengadaan_stok',
    ]
    const detailProdukBerubah = keysDetailProduk.some((key) => bp[key] !== ap[key])
    if (detailProdukBerubah) return true
  }

  for (let j = 0; j < before.detail_jasa.length; j++) {
    const bj = before.detail_jasa[j]
    const aj = after.detail_jasa[j]
    const keysDetailJasa = ['jasa_id', 'harga_jasa_detail_transaksi_jasa']
    const detailJasaBerubah = keysDetailJasa.some((key) => bj[key] !== aj[key])
    if (detailJasaBerubah) return true
  }

  return false
}

async function onEdit(item) {
  try {
    // Panggil API show untuk ambil data lengkap parent + detail
    const response = await axios.get(`/transaksi/${item.id_transaksi}`)
    const data = response.data.data

    // Assign data parent
    Object.assign(transaksiEdit, {
      id_transaksi: data.id_transaksi,
      pelanggan_id: data.pelanggan_id,
      staff_id: data.staff_id,
      nama_pelanggan: data.nama_pelanggan,
      waktu_transaksi: data.waktu_transaksi,
      total_harga_transaksi: data.total_harga_transaksi,
      pembayaran_transaksi: data.pembayaran_transaksi,
      kembalian_transaksi: data.kembalian_transaksi,
      // Salin detail-nya
      detail_produk: (data.detail_transaksi || []).map((dp) => ({ ...dp })),
      detail_jasa: (data.detail_transaksi_jasa || []).map((dj) => ({ ...dj })),
    })

    Object.assign(transaksiEditBefore, JSON.parse(JSON.stringify(transaksiEdit))) // deep copy
    isEdit.value = true
    showFormTransaksi.value = true
    await nextTick()
    updateKembalian()
  } catch (error) {
    toastErr(error)
  }
}

async function simpanTransaksi() {
  const form = formTransaksi.value
  if (form && !form.checkValidity()) {
    form.reportValidity()
    return
  }

  loadingSimpan.value = true
  const token = sessionStorage.getItem('token')
  const idStaff = sessionStorage.getItem('id_staff')

  transaksiEdit.staff_id = parseInt(idStaff) // isi otomatis dari session

  const dataToSend = {
    ...transaksiEdit,

    detail_produk: transaksiEdit.detail_produk
      .filter((item) => item.produk_id !== null) // HANYA produk yang valid
      .map((itemProduk) => {
        const cleanedItem = { ...itemProduk }
        delete cleanedItem.harga_produk_detail_transaksi
        delete cleanedItem.subtotal_produk_detail_transaksi
        delete cleanedItem.produk
        delete cleanedItem.created_at
        return cleanedItem
      }),

    detail_jasa: transaksiEdit.detail_jasa
      .filter((item) => item.jasa_id !== null) // HANYA jasa yang valid
      .map((itemJasa) => {
        const cleanedItem = { ...itemJasa }
        delete cleanedItem.jasa
        delete cleanedItem.harga_jasa_detail_transaksi_jasa
        delete cleanedItem.created_at
        return cleanedItem
      }),
  }

  delete dataToSend.total_harga_transaksi
  delete dataToSend.nama_pelanggan
  delete dataToSend.kembalian_transaksi

  if (isEdit.value) {
    if (!isDataChanged(transaksiEditBefore, transaksiEdit)) {
      toast.info('Tidak ada data yang diubah')
      showFormTransaksi.value = false
      loadingSimpan.value = false
      return
    }

    try {
      const res = await axios.put(`/transaksi/${dataToSend.id_transaksi}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      toastRes(res)
      showFormTransaksi.value = false
      await fetchProduk()
      await fetchTransaksi()
    } catch (error) {
      toastErr(error)
    } finally {
      loadingSimpan.value = false
    }
  } else {
    try {
      const response = await axios.post('/transaksi', dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      toastRes(response)
      const id_transaksi_baru = response.data.id_transaksi
      // Simpan ke state untuk cetak
      transaksiBaruId.value = id_transaksi_baru
      pesanKonfirmasiCetak.value =
        'Transaksi berhasil disimpan. Apakah Anda ingin mencetak invoice sekarang?'
      showKonfirmasiCetak.value = true
      showFormTransaksi.value = false
      await fetchProduk()
      await fetchTransaksi()
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
      !transaksiEdit.detail_produk.some(
        (item) => item.produk_id === option.value && option.value !== selectedId,
      )
    )
  })
}

function onProdukChange(item, index) {
  const produk = produkOptions.value.find((p) => p.value === item.produk_id)
  if (produk) {
    item.harga_produk_detail_transaksi = produk.harga
    updateSubtotalProduk(index)
  }
}

function cekJumlah(item, index) {
  const produk = produkOptions.value.find((p) => p.value === item.produk_id)
  const stok = produk?.stok ?? 0

  if (item.jumlah_produk_detail_transaksi > stok) {
    item.jumlah_produk_detail_transaksi = stok
    toast.warning(`Jumlah melebihi stok (${stok})`)
  }
  updateSubtotalProduk(index)
}

function getFilteredJasaptions(selectedId) {
  return jasaOptions.value.filter((option) => {
    return (
      option.value === selectedId ||
      !transaksiEdit.detail_jasa.some(
        (item) => item.jasa_id === option.value && option.value !== selectedId,
      )
    )
  })
}

function onJasaChange(item) {
  const jasa = jasaOptions.value.find((j) => j.value === item.jasa_id)
  if (jasa) {
    item.harga_jasa_detail_transaksi_jasa = jasa.harga
    updateTotalHarga()
  }
}

const konfirmasiCetakInvoice = (item) => {
  transaksiBaruId.value = item.id_transaksi
  pesanKonfirmasiCetak.value = `Apakah Anda yakin ingin mencetak invoice untuk transaksi dengan No. ${item.nomor_invoice_transaksi || item.id_transaksi}?`
  showKonfirmasiCetak.value = true
}

async function cetakInvoice(item) {
  const token = sessionStorage.getItem('token')

  if (!item?.id_transaksi) {
    toast.warning('ID transaksi tidak valid saat cetakInvoice dipanggil')
    return
  }

  try {
    const response = await axios.get(`/transaksi/${item.id_transaksi}/invoice`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const url = response?.data?.url
    if (url) {
      window.open(url, '_blank')
    } else {
      toast.error('Gagal mendapatkan URL invoice dari server.')
      console.warn('Respon server tidak berisi "url":', response.data)
    }
  } catch (error) {
    toast.error('Gagal mencetak invoice.')
    console.error('Error cetak invoice:', error.response?.data || error.message)
  }
}

function aturTampilanSwitch() {
  if (isEdit.value) {
    tampilkanProduk.value =
      Array.isArray(transaksiEdit.detail_produk) && transaksiEdit.detail_produk.length > 0
    tampilkanJasa.value =
      Array.isArray(transaksiEdit.detail_jasa) && transaksiEdit.detail_jasa.length > 0
  } else {
    tampilkanProduk.value = false
    tampilkanJasa.value = false
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
