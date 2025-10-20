<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePropertiesStore } from '../stores/properties'
import { useToastStore } from '../stores/toast'
import { Plus, Search, Eye, Edit, Trash2, ArrowLeft, ArrowRight, Map, List } from 'lucide-vue-next'
import MapComponent from '../components/MapComponent.vue'

const router = useRouter()
const propertiesStore = usePropertiesStore()
const toastStore = useToastStore()

const searchQuery = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')
const sortBy = ref('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const isLoading = computed(() => propertiesStore.isLoading)
const properties = computed(() => propertiesStore.paginatedProperties)
const totalCount = computed(() => propertiesStore.totalCount)
const currentPage = computed(() => propertiesStore.currentPage)
const totalPages = computed(() => propertiesStore.totalPages)

onMounted(async () => {
  await loadProperties()
})

const loadProperties = async () => {
  try {
    await propertiesStore.fetchProperties({
      page: currentPage.value,
      limit: 10,
      search: searchQuery.value || undefined,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      type: typeFilter.value !== 'all' ? typeFilter.value as 'rental' | 'sale' : undefined,
      status: statusFilter.value !== 'all' ? statusFilter.value as 'available' | 'occupied' : undefined
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load properties'
    toastStore.error(errorMessage)
    toastStore.error('Failed to load properties')
  }
}

const handleSearch = () => {
  propertiesStore.setSearchQuery(searchQuery.value)
  loadProperties()
}

const handleTypeFilter = (value: string) => {
  typeFilter.value = value
  propertiesStore.setTypeFilter(value as 'all' | 'rental' | 'sale')
  loadProperties()
}

const handleStatusFilter = (value: string) => {
  statusFilter.value = value
  propertiesStore.setStatusFilter(value as 'all' | 'available' | 'occupied')
  loadProperties()
}

const handleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
  propertiesStore.setSorting(sortBy.value, sortOrder.value)
  loadProperties()
}

const goToPage = (page: number) => {
  propertiesStore.goToPage(page)
  loadProperties()
}

const viewProperty = (id: number) => {
  router.push(`/properties/${id}`)
}

const editProperty = (id: number) => {
  router.push(`/properties/${id}/edit`)
}

const deleteProperty = async (id: number) => {
  if (confirm('Are you sure you want to delete this property?')) {
    try {
      await propertiesStore.deleteProperty(id)
      toastStore.success('Property deleted successfully')
      loadProperties()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete property'
      toastStore.error(errorMessage)
    }
  }
}

const formatPrice = (price: number, type: string) => {
  if (type === 'rental') {
    return `$${price.toLocaleString()}/month`
  }
  return `$${price.toLocaleString()}`
}

const getStatusBadge = (status: string) => {
  if (status === 'available') {
    return 'status-badge status-available'
  }
  return 'status-badge status-occupied'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Properties</h1>
            <p class="mt-2 text-gray-600">Manage your property portfolio</p>
          </div>
          <button 
            @click="router.push('/properties/add')" 
            class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus class="h-4 w-4" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Filters & Search</h2>
          <p class="text-sm text-gray-600">Filter and search through your properties</p>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  v-model="searchQuery"
                  placeholder="Search properties..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @keypress.enter="handleSearch"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                :value="typeFilter"
                @change="handleTypeFilter(($event.target as HTMLSelectElement).value)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="rental">Rental</option>
                <option value="sale">For Sale</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                :value="statusFilter"
                @change="handleStatusFilter(($event.target as HTMLSelectElement).value)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>

            <div class="flex items-end">
              <button 
                @click="handleSearch" 
                class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Search class="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Properties Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Properties ({{ totalCount }})</h2>
          <p class="text-sm text-gray-600">Your property listings</p>
        </div>
        <div class="p-6">
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-4 text-gray-600">Loading properties...</p>
          </div>

          <div v-else-if="properties.length === 0" class="text-center py-12">
            <p class="text-gray-500">No properties found</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    @click="handleSort('name')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Name</span>
                      <span v-if="sortBy === 'name'" class="text-blue-600">
                        {{ sortOrder === 'asc' ? '↑' : '↓' }}
                      </span>
                    </div>
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    @click="handleSort('type')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Type</span>
                      <span v-if="sortBy === 'type'" class="text-blue-600">
                        {{ sortOrder === 'asc' ? '↑' : '↓' }}
                      </span>
                    </div>
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    @click="handleSort('owner')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Owner</span>
                      <span v-if="sortBy === 'owner'" class="text-blue-600">
                        {{ sortOrder === 'asc' ? '↑' : '↓' }}
                      </span>
                    </div>
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    @click="handleSort('price')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Price</span>
                      <span v-if="sortBy === 'price'" class="text-blue-600">
                        {{ sortOrder === 'asc' ? '↑' : '↓' }}
                      </span>
                    </div>
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    @click="handleSort('status')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Status</span>
                      <span v-if="sortBy === 'status'" class="text-blue-600">
                        {{ sortOrder === 'asc' ? '↑' : '↓' }}
                      </span>
                    </div>
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="property in properties" :key="property.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ property.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {{ property.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ property.owner }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatPrice(property.price, property.type) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="property.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'"
                    >
                      {{ property.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="viewProperty(property.id)"
                        class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                        title="View Details"
                      >
                        <Eye class="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        @click="editProperty(property.id)"
                        class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                        title="Edit Property"
                      >
                        <Edit class="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button
                        @click="deleteProperty(property.id)"
                        class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                        title="Delete Property"
                      >
                        <Trash2 class="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between">
            <button
              class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <ArrowLeft class="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div class="flex space-x-1">
              <button
                v-for="page in Math.min(5, totalPages)"
                :key="page"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                ]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>

            <button
              class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <span>Next</span>
              <ArrowRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* All styles now handled by Tailwind classes */
</style>
