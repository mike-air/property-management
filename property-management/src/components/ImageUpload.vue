<template>
  <div class="image-upload-container">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Property Images</h3>
      <p class="text-sm text-gray-600">Upload images to showcase your property</p>
    </div>

    <!-- Upload Area -->
    <div
      class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
      :class="{ 'border-blue-400 bg-blue-50': isDragOver }"
      @click="triggerFileInput"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />
      
      <div class="flex flex-col items-center">
        <Upload class="h-12 w-12 text-gray-400 mb-4" />
        <p class="text-lg font-medium text-gray-900 mb-2">
          {{ isDragOver ? 'Drop images here' : 'Upload Property Images' }}
        </p>
        <p class="text-sm text-gray-600 mb-4">
          Drag and drop images here, or click to select files
        </p>
        <button
          type="button"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Choose Files
        </button>
      </div>
    </div>

    <!-- Image Preview Grid -->
    <div v-if="images.length > 0" class="mt-6">
      <h4 class="text-md font-medium text-gray-900 mb-3">Uploaded Images ({{ images.length }})</h4>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="(image, index) in images"
          :key="image.id"
          class="relative group"
        >
          <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              :src="image.url"
              :alt="image.alt"
              class="w-full h-full object-cover"
            />
          </div>
          
          <!-- Primary Badge -->
          <div
            v-if="image.isPrimary"
            class="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium"
          >
            Primary
          </div>
          
          <!-- Actions Overlay -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div class="flex space-x-2">
              <button
                v-if="!image.isPrimary"
                @click="setPrimaryImage(index)"
                class="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                title="Set as primary"
              >
                <Star class="h-4 w-4" />
              </button>
              <button
                @click="removeImage(index)"
                class="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                title="Remove image"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="mt-4">
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span class="text-sm text-gray-600">Uploading images...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, Star, Trash2 } from 'lucide-vue-next'
import type { PropertyImage } from '../services/api'

// Props
interface Props {
  modelValue?: PropertyImage[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => []
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [images: PropertyImage[]]
}>()

// Refs
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const uploading = ref(false)

// Computed
const images = computed({
  get: () => props.modelValue || [],
  set: (value) => emit('update:modelValue', value)
})

// Methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    handleFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files) {
    handleFiles(Array.from(event.dataTransfer.files))
  }
}

const handleFiles = async (files: File[]) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length === 0) {
    alert('Please select only image files')
    return
  }

  uploading.value = true

  try {
    const newImages: PropertyImage[] = []
    
    for (const file of imageFiles) {
      // In a real app, you would upload to a server
      // For now, we'll create a local URL
      const imageUrl = URL.createObjectURL(file)
      
      const newImage: PropertyImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: imageUrl,
        alt: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        isPrimary: images.value.length === 0 // First image is primary
      }
      
      newImages.push(newImage)
    }
    
    // Add new images to existing ones
    images.value = [...images.value, ...newImages]
    
  } catch (error) {
    console.error('Error uploading images:', error)
    alert('Error uploading images. Please try again.')
  } finally {
    uploading.value = false
  }
}

const setPrimaryImage = (index: number) => {
  const updatedImages = images.value.map((img, i) => ({
    ...img,
    isPrimary: i === index
  }))
  images.value = updatedImages
}

const removeImage = (index: number) => {
  const imageToRemove = images.value[index]
  
  // Revoke the object URL to free memory
  if (imageToRemove.url.startsWith('blob:')) {
    URL.revokeObjectURL(imageToRemove.url)
  }
  
  const updatedImages = images.value.filter((_, i) => i !== index)
  
  // If we removed the primary image, set the first remaining image as primary
  if (imageToRemove.isPrimary && updatedImages.length > 0) {
    updatedImages[0].isPrimary = true
  }
  
  images.value = updatedImages
}
</script>

<style scoped>
.image-upload-container {
  @apply w-full;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}
</style>
