<template>
  <div class="image-gallery">
    <div v-if="images.length === 0" class="text-center py-12">
      <ImageIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500">No images available</p>
    </div>

    <div v-else class="space-y-4">
      <!-- Primary Image -->
      <div v-if="primaryImage" class="relative">
        <div class="aspect-video rounded-lg overflow-hidden bg-gray-100">
          <img
            :src="primaryImage.url"
            :alt="primaryImage.alt"
            class="w-full h-full object-cover cursor-pointer"
            @click="openLightbox(0)"
          />
        </div>
        <div class="absolute top-3 left-3 bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
          Primary Image
        </div>
      </div>

      <!-- Thumbnail Grid -->
      <div v-if="images.length > 1" class="grid grid-cols-4 md:grid-cols-6 gap-2">
        <div
          v-for="(image, index) in images"
          :key="image.id"
          class="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
          :class="{ 'ring-2 ring-blue-500': image.isPrimary }"
          @click="openLightbox(index)"
        >
          <img
            :src="image.url"
            :alt="image.alt"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          <!-- Primary Badge for thumbnails -->
          <div
            v-if="image.isPrimary"
            class="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded font-medium"
          >
            ★
          </div>
        </div>
      </div>

      <!-- Image Count -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          {{ images.length }} {{ images.length === 1 ? 'image' : 'images' }}
        </p>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div
      v-if="lightboxOpen"
      class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      @click="closeLightbox"
    >
      <div class="relative max-w-4xl max-h-full">
        <!-- Close Button -->
        <button
          @click="closeLightbox"
          class="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
        >
          <X class="h-6 w-6" />
        </button>

        <!-- Navigation Buttons -->
        <button
          v-if="images.length > 1"
          @click.stop="previousImage"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
        >
          <ChevronLeft class="h-6 w-6" />
        </button>

        <button
          v-if="images.length > 1"
          @click.stop="nextImage"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
        >
          <ChevronRight class="h-6 w-6" />
        </button>

        <!-- Main Image -->
        <img
          :src="currentImage?.url"
          :alt="currentImage?.alt"
          class="max-w-full max-h-full object-contain"
          @click.stop
        />

        <!-- Image Info -->
        <div class="absolute bottom-4 left-4 right-4 text-center">
          <p class="text-white text-lg font-medium">{{ currentImage?.alt }}</p>
          <p class="text-gray-300 text-sm">
            {{ currentImageIndex + 1 }} of {{ images.length }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { PropertyImage } from '../services/api'

// Props
interface Props {
  images: PropertyImage[]
}

const props = defineProps<Props>()

// Refs
const lightboxOpen = ref(false)
const currentImageIndex = ref(0)

// Computed
const primaryImage = computed(() => {
  return props.images.find(img => img.isPrimary) || props.images[0]
})

const currentImage = computed(() => {
  return props.images[currentImageIndex.value]
})

// Methods
const openLightbox = (index: number) => {
  currentImageIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = 'auto'
}

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % props.images.length
}

const previousImage = () => {
  currentImageIndex.value = currentImageIndex.value === 0 
    ? props.images.length - 1 
    : currentImageIndex.value - 1
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!lightboxOpen.value) return

  switch (event.key) {
    case 'Escape':
      closeLightbox()
      break
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
.image-gallery {
  @apply w-full;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}
</style>
