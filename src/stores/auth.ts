import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiService, type LoginRequest, type User } from '../services/api'
import { useToastStore } from './toast'

// Type for authenticated user (without password)
type AuthenticatedUser = Omit<User, 'password'>

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthenticatedUser | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userEmail = computed(() => user.value?.email || '')

  // Actions
  const login = async (credentials: LoginRequest) => {
    isLoading.value = true
    error.value = null
    const toastStore = useToastStore()

    try {
      const response = await apiService.login(credentials)

      // Store token and user data
      token.value = response.token
      user.value = response.user

      // Persist token to localStorage
      apiService.setAuthToken(response.token)

      toastStore.success(`Welcome back, ${response.user.email}!`)
      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      error.value = errorMessage
      toastStore.error(`Login failed: ${errorMessage}`)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    const toastStore = useToastStore()
    const userEmail = user.value?.email || 'User'

    try {
      await apiService.logout()
      toastStore.info(`Goodbye, ${userEmail}! You have been logged out.`)
    } finally {
      // Clear local state
      user.value = null
      token.value = null
      error.value = null
    }
  }

  const initializeAuth = () => {
    const storedToken = apiService.getAuthToken()
    if (storedToken) {
      token.value = storedToken

      user.value = {
        id: 1,
        email: 'admin@example.com',
        token: storedToken,
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userEmail,

    // Actions
    login,
    logout,
    initializeAuth,
    clearError,
  }
})
