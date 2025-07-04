import { ref } from 'vue'

const isLoading = ref(false)

const useLoading = () => {
  const startLoading = () => (isLoading.value = true)
  const stopLoading = () => (isLoading.value = false)

  return {
    isLoading,
    startLoading,
    stopLoading,
  }
}

export default useLoading
