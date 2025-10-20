<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed. Please check your credentials.'
    toastStore.error('Login failed. Please check your credentials.')
    toastStore.error(errorMessage)
    isLoading.value = false
  }
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleLogin()
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="min-h-screen bg-white flex">
    <!-- Left Side - Login Form -->
    <div class="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <!-- Logo/Brand -->
        <div class="mb-8">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">P</span>
            </div>
            <span class="text-2xl font-bold text-gray-900">PropertyPro</span>
          </div>
        </div>

        <!-- Sign In Title -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Sign in</h1>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address<span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              :disabled="isLoading"
              @keypress="handleKeyPress"
            />
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password<span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                :disabled="isLoading"
                @keypress="handleKeyPress"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Eye v-if="!showPassword" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Sign In Button -->
          <button
            type="submit"
            class="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="isLoading"
          >
            <ArrowRight v-if="!isLoading" class="h-4 w-4 mr-2" />
            {{ isLoading ? 'Signing in...' : 'Continue' }}
          </button>
        </form>

       

        <!-- Terms -->
        <div class="mt-8 text-center">
          <p class="text-xs text-gray-500">
            By submitting, I accept PropertyPro's 
            <a href="#" class="text-blue-600 hover:text-blue-500 transition-colors">terms of use</a>
          </p>
        </div>

        <!-- Demo Credentials -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <p class="text-sm font-medium text-gray-900 mb-2">Demo Credentials:</p>
          <p class="text-sm text-gray-600">Email: admin@example.com</p>
          <p class="text-sm text-gray-600">Password: password</p>
        </div>
      </div>
    </div>

    <!-- Right Side - Lifestyle Image -->
    <div class="hidden lg:block lg:flex-1 relative">
      <div class="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Happy family in their home"
          class="w-full h-full object-cover"
        />
      </div>
      <!-- Optional overlay for better text contrast if needed -->
      <div class="absolute inset-0 bg-gradient-to-l from-transparent to-white/10"></div>
    </div>
  </div>
</template>

<style scoped>
/* All styles now handled by Tailwind classes */
</style>