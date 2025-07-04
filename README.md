# 🌐 Frontend – Vue 3 + BootstrapVue Next

Ini adalah bagian frontend dari Sistem Informasi Bengkel Han’s Motor. Dibangun menggunakan Vue 3 dengan komponen BootstrapVue Next.

---

## 🧰 Teknologi
- Vue 3
- Vite
- BootstrapVue Next
- Axios
- Vue Router
- sessionStorage (token login)

---

## 📦 Instalasi

### 1. Masuk Folder
```bash
cd sistem-informasi-bengkel/hans-frontend
```

### 2. Install Dependency
```bash
npm install
```

### 3. Atur URL API
Buat atau edit file `.env`:
```
VITE_API_URL=http://127.0.0.1:8000/api
```

### 4. Jalankan Dev Server
```bash
npm run dev
```

---

## 🔐 Login & Token
- Setelah login, token disimpan di `sessionStorage`
- Token dikirim di header:
  ```
  Authorization: Bearer {token}
  ```

---

## 📁 Struktur Penting
- `src/views/` – Halaman utama (Login, Dashboard, dll)
- `src/components/` – Komponen UI seperti tabel, modal
- `src/router/` – Routing dan proteksi role
- `src/store/` – Menyimpan state token dan data user

---

## 🚫 File di .gitignore
```
/node_modules
/dist
.env
```

---

## 🛠 Build untuk Produksi
```bash
npm run build
```