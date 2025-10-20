<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePropertiesStore } from '../stores/properties'
import { useToastStore } from '../stores/toast'
import { ArrowLeft, Save, RotateCcw } from 'lucide-vue-next'
import ImageUpload from '../components/ImageUpload.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Label } from '../components/ui/label'
import type { PropertyImage } from '../services/api'

const route = useRoute()
const router = useRouter()
const propertiesStore = usePropertiesStore()
const toastStore = useToastStore()

const isLoading = ref(false)
const isSaving = ref(false)

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

const handleSubmit = async () => {
  if (!validateForm()) {
    toastStore.error('Please fix the errors before submitting')
    return
  }
  
  isSaving.value = true
  
  try {
    const propertyId = Number(route.params.id)
    await propertiesStore.updateProperty(propertyId, formData.value)
    toastStore.success('Property updated successfully!')
    router.push(`/properties/${propertyId}`)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update property'
    toastStore.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}

const resetForm = () => {
  // Reset to original property data
  loadProperty()
}

const loadProperty = async () => {
  const propertyId = Number(route.params.id)
  if (!propertyId) {
    router.push('/properties')
    return
  }
  
  isLoading.value = true
  
  try {
    await propertiesStore.fetchProperty(propertyId)
    const property = propertiesStore.currentProperty
    
    if (property) {
      formData.value = {
        name: property.name,
        type: property.type,
        owner: property.owner,
        price: property.price,
        status: property.status,
        latitude: property.latitude,
        longitude: property.longitude,
        description: property.description || '',
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        squareFeet: property.squareFeet || 0,
        address: property.address || '',
        images: property.images || []
      }
    } else {
      toastStore.error('Property not found')
      router.push('/properties')
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load property'
    toastStore.error(errorMessage)
    router.push('/properties')
  } finally {
    isLoading.value = false
  }
}

const handleImagesChange = (images: PropertyImage[]) => {
  formData.value.images = images
}

onMounted(() => {
  loadProperty()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <button 
          @click="router.push('/properties')" 
          class="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft class="h-4 w-4" />
          <span>Back to Properties</span>
        </button>
        
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Edit Property</h1>
            <p class="mt-2 text-lg text-gray-600">Update property information</p>
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="resetForm"
              class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw class="h-4 w-4" />
              <span>Reset</span>
            </button>
            
            <button
              @click="handleSubmit"
              :disabled="isSaving"
              class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Save class="h-4 w-4" />
              <span>{{ isSaving ? 'Saving...' : 'Save Changes' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-24">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Loading property details</h3>
        <p class="text-gray-500">Please wait while we fetch the property information...</p>
      </div>

      <!-- Form -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200">
        <form @submit.prevent="handleSubmit" class="p-6 space-y-8">
          <!-- Basic Information -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Property Name -->
              <div class="md:col-span-2">
                <Label for="name" class="text-sm font-medium text-gray-700 mb-2">Property Name *</Label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  placeholder="Enter property name"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.name }"
                />
                <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
              </div>

              <!-- Property Type -->
              <div>
                <Label class="text-sm font-medium text-gray-700 mb-2">Property Type *</Label>
                <Select v-model="formData.type">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rental">Rental</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Owner -->
              <div>
                <Label for="owner" class="text-sm font-medium text-gray-700 mb-2">Owner *</Label>
                <input
                  id="owner"
                  v-model="formData.owner"
                  type="text"
                  placeholder="Enter owner name"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.owner }"
                />
                <p v-if="errors.owner" class="mt-1 text-sm text-red-600">{{ errors.owner }}</p>
              </div>

              <!-- Price -->
              <div>
                <Label for="price" class="text-sm font-medium text-gray-700 mb-2">Price *</Label>
                <input
                  id="price"
                  v-model.number="formData.price"
                  type="number"
                  placeholder="Enter price"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.price }"
                />
                <p v-if="errors.price" class="mt-1 text-sm text-red-600">{{ errors.price }}</p>
              </div>

              <!-- Status -->
              <div>
                <Label class="text-sm font-medium text-gray-700 mb-2">Status *</Label>
                <Select v-model="formData.status">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <!-- Property Details -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Property Details</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Bedrooms -->
              <div>
                <Label for="bedrooms" class="text-sm font-medium text-gray-700 mb-2">Bedrooms</Label>
                <input
                  id="bedrooms"
                  v-model.number="formData.bedrooms"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Bathrooms -->
              <div>
                <Label for="bathrooms" class="text-sm font-medium text-gray-700 mb-2">Bathrooms</Label>
                <input
                  id="bathrooms"
                  v-model.number="formData.bathrooms"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Square Feet -->
              <div>
                <Label for="squareFeet" class="text-sm font-medium text-gray-700 mb-2">Square Feet</Label>
                <input
                  id="squareFeet"
                  v-model.number="formData.squareFeet"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Location -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Location</h2>
            
            <div class="space-y-6">
              <!-- Address -->
              <div>
                <Label for="address" class="text-sm font-medium text-gray-700 mb-2">Address *</Label>
                <input
                  id="address"
                  v-model="formData.address"
                  type="text"
                  placeholder="Enter full address"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.address }"
                />
                <p v-if="errors.address" class="mt-1 text-sm text-red-600">{{ errors.address }}</p>
              </div>

              <!-- Coordinates -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label for="latitude" class="text-sm font-medium text-gray-700 mb-2">Latitude *</Label>
                  <input
                    id="latitude"
                    v-model.number="formData.latitude"
                    type="number"
                    step="any"
                    placeholder="37.7749"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.latitude }"
                  />
                  <p v-if="errors.latitude" class="mt-1 text-sm text-red-600">{{ errors.latitude }}</p>
                  <p class="mt-1 text-xs text-gray-500">Range: -90 to 90 (e.g., 37.7749 for San Francisco)</p>
                </div>

                <div>
                  <Label for="longitude" class="text-sm font-medium text-gray-700 mb-2">Longitude *</Label>
                  <input
                    id="longitude"
                    v-model.number="formData.longitude"
                    type="number"
                    step="any"
                    placeholder="-122.4194"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.longitude }"
                  />
                  <p v-if="errors.longitude" class="mt-1 text-sm text-red-600">{{ errors.longitude }}</p>
                  <p class="mt-1 text-xs text-gray-500">Range: -180 to 180 (e.g., -122.4194 for San Francisco)</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Description</h2>
            
            <div>
              <Label for="description" class="text-sm font-medium text-gray-700 mb-2">Property Description</Label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="4"
                placeholder="Enter property description"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>

          <!-- Images -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Property Images</h2>
            
            <ImageUpload
              :images="formData.images"
              @update:images="handleImagesChange"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* All styles handled by Tailwind classes */
</style>
