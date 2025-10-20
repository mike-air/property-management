<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { Mail, Lock, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    toastStore.error('Please fill in all fields')
    return
  }

  isLoading.value = true
  
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    })
    
    toastStore.success('Login successful!')
    router.push('/properties')
  } catch (error) {
    toastStore.error('Login failed. Please check your credentials.')
  } finally {
    isLoading.value = false
  }
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleLogin()
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">Property Management</h1>
        <p class="mt-2 text-sm text-gray-600">Sign in to your account</p>
      </div>

      <div class="bg-white py-8 px-6 shadow-lg rounded-lg">
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Login</h2>
        <p class="text-sm text-gray-600 mb-6">
          Enter your email and password to access the property management system
        </p>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="admin@example.com"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                :disabled="isLoading"
                @keypress="handleKeyPress"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="Enter your password"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                :disabled="isLoading"
                @keypress="handleKeyPress"
              />
            </div>
          </div>

          <button
            type="submit"
            class="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="isLoading"
          >
            <ArrowRight v-if="!isLoading" class="h-4 w-4 mr-2" />
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <p class="text-sm font-medium text-gray-900 mb-2">Demo Credentials:</p>
          <p class="text-sm text-gray-600">Email: admin@example.com</p>
          <p class="text-sm text-gray-600">Password: password</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* All styles now handled by Tailwind classes */
</style>