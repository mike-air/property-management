import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'

export const useToastStore = defineStore('toast', () => {
  // Convenience methods using vue-sonner
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
