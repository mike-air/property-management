<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { User, LogOut } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const userEmail = computed(() => authStore.userEmail)
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Initialize auth state when app mounts
onMounted(() => {
  authStore.initializeAuth()
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav v-if="isAuthenticated" class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-8">
            <h1 class="text-xl font-semibold text-gray-900">Property Management</h1>
            <div class="flex space-x-4">
              <router-link
                to="/properties"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="$route.path === '/properties' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
              >
                Properties
              </router-link>
            </div>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <User class="h-4 w-4" />
              <span>{{ userEmail }}</span>
            </div>
            <button 
              @click="handleLogout" 
              class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <LogOut class="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main :class="{ 'pt-0': !isAuthenticated }">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* All styles now handled by Tailwind classes */
</style>