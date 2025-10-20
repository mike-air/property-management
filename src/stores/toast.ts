import { defineStore } from 'pinia'
import { useToast } from 'vue-toast-notification'

export const useToastStore = defineStore('toast', () => {
  const toast = useToast()

  // Convenience methods using vue-toast-notification
  const success = (message: string) => {
    toast.success(message)
  }

  const error = (message: string) => {
    toast.error(message)
  }

  const warning = (message: string) => {
    toast.warning(message)
  }

  const info = (message: string) => {
    toast.info(message)
  }

  return {
    success,
    error,
    warning,
    info,
  }
})
