import { defineStore } from 'pinia'
import { useToaster } from 'vue-toaster'

export const useToastStore = defineStore('toast', () => {
  const toaster = useToaster()

  // Convenience methods using vue-toaster
  const success = (message: string) => {
    toaster.success(message)
  }

  const error = (message: string) => {
    toaster.error(message)
  }

  const warning = (message: string) => {
    toaster.warning(message)
  }

  const info = (message: string) => {
    toaster.info(message)
  }

  return {
    success,
    error,
    warning,
    info,
  }
})
