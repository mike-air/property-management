<template>
  <div class="advanced-search">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Advanced Search</h2>
            <p class="text-sm text-gray-600">Find properties with detailed filters</p>
          </div>
          <div class="flex space-x-2">
            <Button
              @click="toggleExpanded"
              variant="ghost"
              size="sm"
              class="text-blue-600 hover:text-blue-700"
            >
              {{ isExpanded ? 'Collapse' : 'Expand' }}
            </Button>
            <Button
              @click="clearAllFilters"
              variant="ghost"
              size="sm"
              class="text-gray-600 hover:text-gray-700"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      <div class="p-6">
        <!-- Basic Search -->
        <div class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label class="text-sm font-medium text-gray-700 mb-2">Search</Label>
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  v-model="filters.search"
                  placeholder="Property name, address, owner..."
                  class="pl-10"
                  @input="handleSearchChange"
                />
              </div>
            </div>

            <div>
              <Label class="text-sm font-medium text-gray-700 mb-2">Type</Label>
              <Select v-model="filters.type" @update:model-value="handleFilterChange">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="rental">Rental</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label class="text-sm font-medium text-gray-700 mb-2">Status</Label>
              <Select v-model="filters.status" @update:model-value="handleFilterChange">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <!-- Advanced Filters (Expandable) -->
        <div v-if="isExpanded" class="space-y-6">
          <!-- Price Range -->
          <div>
            <h3 class="text-md font-medium text-gray-900 mb-3">Price Range</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                <div class="relative">
                  <DollarSign class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    v-model.number="filters.minPrice"
                    type="number"
                    placeholder="0"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @input="handleFilterChange"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                <div class="relative">
                  <DollarSign class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    v-model.number="filters.maxPrice"
                    type="number"
                    placeholder="No limit"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @input="handleFilterChange"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Property Details -->
          <div>
            <h3 class="text-md font-medium text-gray-900 mb-3">Property Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Min Bedrooms</label>
                <select
                  v-model="filters.minBedrooms"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @change="handleFilterChange"
                >
                  <option value="0">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Min Bathrooms</label>
                <select
                  v-model="filters.minBathrooms"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @change="handleFilterChange"
                >
                  <option value="0">Any</option>
                  <option value="1">1+</option>
                  <option value="1.5">1.5+</option>
                  <option value="2">2+</option>
                  <option value="2.5">2.5+</option>
                  <option value="3">3+</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Min Square Feet</label>
                <div class="relative">
                  <Home class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    v-model.number="filters.minSquareFeet"
                    type="number"
                    placeholder="0"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @input="handleFilterChange"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Location Filters -->
          <div>
            <h3 class="text-md font-medium text-gray-900 mb-3">Location</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">City/Area</label>
                <input
                  v-model="filters.location"
                  placeholder="Enter city or area..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @input="handleSearchChange"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Owner</label>
                <input
                  v-model="filters.owner"
                  placeholder="Property owner name..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @input="handleSearchChange"
                />
              </div>
            </div>
          </div>

          <!-- Quick Filters -->
          <div>
            <h3 class="text-md font-medium text-gray-900 mb-3">Quick Filters</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="quickFilter in quickFilters"
                :key="quickFilter.key"
                @click="applyQuickFilter(quickFilter)"
                class="px-3 py-1 text-sm font-medium rounded-full border transition-colors"
                :class="quickFilter.active 
                  ? 'bg-blue-100 text-blue-700 border-blue-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'"
              >
                {{ quickFilter.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Search Actions -->
        <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button
            @click="handleSearch"
            class="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Search class="h-4 w-4" />
            <span>Search Properties</span>
          </button>
          
          <button
            @click="saveSearch"
            class="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Bookmark class="h-4 w-4" />
            <span>Save Search</span>
          </button>

          <div class="text-sm text-gray-600 flex items-center">
            <span v-if="activeFiltersCount > 0">
              {{ activeFiltersCount }} filter{{ activeFiltersCount === 1 ? '' : 's' }} active
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, DollarSign, Home, Bookmark } from 'lucide-vue-next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

// Props
interface Props {
  modelValue?: SearchFilters
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({} as SearchFilters)
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [filters: SearchFilters]
  'search': [filters: SearchFilters]
  'save-search': [filters: SearchFilters]
}>()

// Types
export interface SearchFilters {
  search?: string
  type?: string
  status?: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  minBathrooms?: number
  minSquareFeet?: number
  location?: string
  owner?: string
}

interface QuickFilter {
  key: string
  label: string
  active: boolean
}

// Refs
const isExpanded = ref(false)

const filters = ref<SearchFilters>({
  search: '',
  type: 'all',
  status: 'all',
  minPrice: undefined,
  maxPrice: undefined,
  minBedrooms: 0,
  minBathrooms: 0,
  minSquareFeet: undefined,
  location: '',
  owner: ''
})

const quickFilters = ref([
  { key: 'available', label: 'Available Only', active: false },
  { key: 'rental', label: 'Rental Properties', active: false },
  { key: 'sale', label: 'For Sale', active: false },
  { key: 'luxury', label: 'Luxury ($500k+)', active: false },
  { key: 'affordable', label: 'Affordable (<$200k)', active: false }
])

// Computed
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.search) count++
  if (filters.value.type !== 'all') count++
  if (filters.value.status !== 'all') count++
  if (filters.value.minPrice) count++
  if (filters.value.maxPrice) count++
  if (filters.value.minBedrooms && filters.value.minBedrooms > 0) count++
  if (filters.value.minBathrooms && filters.value.minBathrooms > 0) count++
  if (filters.value.minSquareFeet) count++
  if (filters.value.location) count++
  if (filters.value.owner) count++
  return count
})

// Methods
const handleSearchChange = () => {
  emit('update:modelValue', filters.value)
}

const handleFilterChange = () => {
  emit('update:modelValue', filters.value)
}

const handleSearch = () => {
  emit('search', filters.value)
}

const saveSearch = () => {
  emit('save-search', filters.value)
}

const clearAllFilters = () => {
  filters.value = {
    search: '',
    type: 'all',
    status: 'all',
    minPrice: undefined,
    maxPrice: undefined,
    minBedrooms: 0,
    minBathrooms: 0,
    minSquareFeet: undefined,
    location: '',
    owner: ''
  }
  
  quickFilters.value.forEach(filter => {
    filter.active = false
  })
  
  emit('update:modelValue', filters.value)
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const applyQuickFilter = (quickFilter: QuickFilter) => {
  quickFilter.active = !quickFilter.active
  
  switch (quickFilter.key) {
    case 'available':
      filters.value.status = quickFilter.active ? 'available' : 'all'
      break
    case 'rental':
      filters.value.type = quickFilter.active ? 'rental' : 'all'
      break
    case 'sale':
      filters.value.type = quickFilter.active ? 'sale' : 'all'
      break
    case 'luxury':
      filters.value.minPrice = quickFilter.active ? 500000 : undefined
      break
    case 'affordable':
      filters.value.maxPrice = quickFilter.active ? 200000 : undefined
      break
  }
  
  emit('update:modelValue', filters.value)
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    filters.value = { ...filters.value, ...newValue }
  }
}, { deep: true })
</script>

<style scoped>
.advanced-search {
  width: 100%;
}
</style>
