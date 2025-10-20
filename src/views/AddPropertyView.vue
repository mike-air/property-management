<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePropertiesStore } from '../stores/properties'
import { useToastStore } from '../stores/toast'
import { ArrowLeft, Save, RotateCcw } from 'lucide-vue-next'
import ImageUpload from '../components/ImageUpload.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Label } from '../components/ui/label'
import type { PropertyImage } from '../services/api'
const router = useRouter()
const propertiesStore = usePropertiesStore()
const toastStore = useToastStore()

const isLoading = ref(false)

const formData = ref({
  name: '',
  type: 'rental' as 'rental' | 'sale',
  owner: '',
  price: 0,
  status: 'available' as 'available' | 'occupied',
  latitude: 37.7749,
  longitude: -122.4194,
  description: '',
  bedrooms: 0,
  bathrooms: 0,
  squareFeet: 0,
  address: '',
  images: [] as PropertyImage[]
})

const errors = ref<Record<string, string>>({})

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Property name is required'
  }
  
  if (!formData.value.owner.trim()) {
    errors.value.owner = 'Owner name is required'
  }
  
  if (formData.value.price <= 0) {
    errors.value.price = 'Price must be greater than 0'
  }
  
  if (!formData.value.address.trim()) {
    errors.value.address = 'Address is required'
  }
  
  if (formData.value.latitude < -90 || formData.value.latitude > 90) {
    errors.value.latitude = 'Latitude must be between -90 and 90'
  }
  
  if (formData.value.longitude < -180 || formData.value.longitude > 180) {
    errors.value.longitude = 'Longitude must be between -180 and 180'
  }
  
  return Object.keys(errors.value).length === 0
}

const validateCoordinates = () => {
  const errors: Record<string, string> = {}
  
  // Validate latitude
  if (formData.value.latitude < -90 || formData.value.latitude > 90) {
    errors.latitude = 'Latitude must be between -90 and 90'
  }
  
  // Validate longitude
  if (formData.value.longitude < -180 || formData.value.longitude > 180) {
    errors.longitude = 'Longitude must be between -180 and 180'
  }
  
  return errors
}

const handleSubmit = async () => {
  if (!validateForm()) {
    toastStore.error('Please fix the form errors')
    return
  }
  
  // Validate coordinates
  const coordinateErrors = validateCoordinates()
  if (Object.keys(coordinateErrors).length > 0) {
    errors.value = { ...errors.value, ...coordinateErrors }
    toastStore.error('Please fix the coordinate errors')
    return
  }
  
  isLoading.value = true
  
  try {
    await propertiesStore.createProperty(formData.value)
    toastStore.success('Property created successfully!')
    router.push('/properties')
    } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create property'
    toastStore.error(errorMessage)
    toastStore.error('Failed to create property')
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    type: 'rental',
    owner: '',
    price: 0,
    status: 'available',
    latitude: 37.7749,
    longitude: -122.4194,
    description: '',
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 0,
    address: '',
    images: []
  }
  errors.value = {}
}

const handleCancel = () => {
  router.push('/properties')
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && event.ctrlKey) {
    handleSubmit()
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <button 
          @click="handleCancel" 
          class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-4"
        >
          <ArrowLeft class="h-4 w-4" />
          <span>Back to Properties</span>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p class="mt-2 text-gray-600">Create a new property listing</p>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Property Information</h2>
          <p class="text-sm text-gray-600">Fill in the details for the new property</p>
        </div>
        <div class="p-6">
          <form @submit.prevent="handleSubmit" @keypress="handleKeyPress" class="space-y-8">
            <!-- Basic Information -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Property Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.name"
                    type="text"
                    placeholder="e.g., Ocean View Apartment"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.name }"
                    required
                  />
                  <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
                </div>

                <div>
                  <Label class="block text-sm font-medium text-gray-700 mb-2">
                    Type <span class="text-red-500">*</span>
                  </Label>
                  <Select v-model="formData.type" required>
                    <SelectTrigger class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rental">Rental</SelectItem>
                      <SelectItem value="sale">For Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Owner <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.owner"
                    type="text"
                    placeholder="Owner name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.owner }"
                    required
                  />
                  <p v-if="errors.owner" class="mt-1 text-sm text-red-600">{{ errors.owner }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Price <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="formData.price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.price }"
                    required
                  />
                  <p v-if="errors.price" class="mt-1 text-sm text-red-600">{{ errors.price }}</p>
                </div>

                <div>
                  <Label class="block text-sm font-medium text-gray-700 mb-2">Status</Label>
                  <Select v-model="formData.status">
                    <SelectTrigger class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Address <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.address"
                    type="text"
                    placeholder="Property address"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.address }"
                    required
                  />
                  <p v-if="errors.address" class="mt-1 text-sm text-red-600">{{ errors.address }}</p>
                </div>
              </div>
            </div>

            <!-- Property Details -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <input
                    v-model.number="formData.bedrooms"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <input
                    v-model.number="formData.bathrooms"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Square Feet</label>
                  <input
                    v-model.number="formData.squareFeet"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Property Description</label>
                <textarea
                  v-model="formData.description"
                  placeholder="Property description..."
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>

            <!-- Property Images -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Property Images</h3>
              <ImageUpload v-model="formData.images" />
            </div>

            <!-- Location -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Latitude <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model.number="formData.latitude"
                        type="number"
                        step="0.000001"
                        placeholder="37.7749"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.latitude }"
                        required
                      />
                      <p v-if="errors.latitude" class="mt-1 text-sm text-red-600">{{ errors.latitude }}</p>
                      <p class="mt-1 text-xs text-gray-500">Range: -90 to 90 (e.g., 37.7749 for San Francisco)</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Longitude <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model.number="formData.longitude"
                        type="number"
                        step="0.000001"
                        placeholder="-122.4194"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.longitude }"
                        required
                      />
                      <p v-if="errors.longitude" class="mt-1 text-sm text-red-600">{{ errors.longitude }}</p>
                      <p class="mt-1 text-xs text-gray-500">Range: -180 to 180 (e.g., -122.4194 for San Francisco)</p>
                    </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="resetForm"
                class="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RotateCcw class="h-4 w-4" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                @click="handleCancel"
                class="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ArrowLeft class="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <span v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                <Save v-else class="h-4 w-4" />
                <span>{{ isLoading ? 'Creating...' : 'Create Property' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* All styles now handled by Tailwind classes */
</style>
