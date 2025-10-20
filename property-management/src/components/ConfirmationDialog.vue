<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="handleCancel"
    ></div>
    
    <!-- Dialog -->
    <div class="relative bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full mx-4 animate-fade-in-up">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle class="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
            <p class="text-sm text-gray-600">{{ subtitle }}</p>
          </div>
        </div>
        
        <!-- Content -->
        <div class="mb-6">
          <p class="text-gray-700">{{ message }}</p>
          <div v-if="details" class="mt-3 p-3 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600">{{ details }}</p>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <Button
            @click="handleCancel"
            variant="outline"
            class="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            @click="handleConfirm"
            variant="destructive"
            class="px-4 py-2"
            :disabled="isLoading"
          >
            <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ confirmText }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import { Button } from './ui/button'

interface Props {
  isOpen: boolean
  title?: string
  subtitle?: string
  message: string
  details?: string
  confirmText?: string
  isLoading?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm Action',
  subtitle: 'This action cannot be undone',
  confirmText: 'Confirm',
  isLoading: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.2s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
