import { useToast } from 'vue-toastification'

const toast = useToast()

/**
 * Tampilkan toast dari response axios
 * @param {object} res
 */
export function toastRes(res) {
  const d = res?.data
  const msg = d?.message || 'Berhasil'
  const err = d?.errors

  toast.dismiss()

  d?.status === false ? toast.error(msg) : toast.success(msg)

  if (err && typeof err === 'object') {
    Object.values(err)
      .flat()
      .forEach((e) => toast.error(e))
  }
}

/**
 * Tampilkan toast dari error axios
 * @param {object} err
 */
export function toastErr(err) {
  const d = err?.response?.data
  const msg = d?.message || err?.message || 'Terjadi kesalahan'
  const val = d?.errors

  toast.dismiss()
  toast.error(msg)

  if (val && typeof val === 'object') {
    Object.values(val)
      .flat()
      .forEach((e) => toast.error(e))
  }
}

/**
 * Tampilkan toast untuk login (fallback: 'Login berhasil.')
 * @param {object} res
 */
export function toastLoginRes(res) {
  toastRes({
    ...res,
    data: {
      ...res.data,
      message: res?.data?.message || 'Login berhasil.',
    },
  })
}
