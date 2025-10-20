import { useToastStore } from '../stores/toast'

export interface PropertyUpdateEvent {
  type: 'property_created' | 'property_updated' | 'property_deleted'
  property: {
    id: number
    name: string
    type: 'rental' | 'sale'
    owner: string
    price: number
    status: 'available' | 'occupied'
    latitude: number
    longitude: number
    description?: string
    bedrooms?: number
    bathrooms?: number
    squareFeet?: number
    address?: string
    images?: Array<{
      id: string
      url: string
      alt: string
      isPrimary: boolean
    }>
    createdAt: string
    updatedAt: string
  }
}

export interface SSEConnection {
  eventSource: EventSource | null
  isConnected: boolean
  reconnectAttempts: number
  maxReconnectAttempts: number
}

class SSEService {
  private connection: SSEConnection = {
    eventSource: null,
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  }

  private listeners: Array<(event: PropertyUpdateEvent) => void> = []
  private toastStore = useToastStore()

  // Connect to SSE endpoint
  connect(): void {
    if (this.connection.eventSource) {
      this.disconnect()
    }

    try {
      this.connection.eventSource = new EventSource('http://localhost:3001/api/events')
      
      this.connection.eventSource.onopen = () => {
        console.log('SSE connection opened')
        this.connection.isConnected = true
        this.connection.reconnectAttempts = 0
      }

      this.connection.eventSource.onmessage = (event) => {
        try {
          const data: PropertyUpdateEvent = JSON.parse(event.data)
          this.handlePropertyUpdate(data)
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }

      this.connection.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        this.connection.isConnected = false
        this.handleReconnect()
      }

    } catch (error) {
      console.error('Failed to create SSE connection:', error)
      this.handleReconnect()
    }
  }

  // Disconnect from SSE
  disconnect(): void {
    if (this.connection.eventSource) {
      this.connection.eventSource.close()
      this.connection.eventSource = null
      this.connection.isConnected = false
      console.log('SSE connection closed')
    }
  }

  // Add event listener
  addEventListener(listener: (event: PropertyUpdateEvent) => void): void {
    this.listeners.push(listener)
  }

  // Remove event listener
  removeEventListener(listener: (event: PropertyUpdateEvent) => void): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // Handle property update events
  private handlePropertyUpdate(event: PropertyUpdateEvent): void {
    console.log('Received property update:', event)
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in SSE listener:', error)
      }
    })

    // Show toast notification
    this.showUpdateNotification(event)
  }

  // Show toast notification for updates
  private showUpdateNotification(event: PropertyUpdateEvent): void {
    const propertyName = event.property.name
    
    switch (event.type) {
      case 'property_created':
        this.toastStore.success(`New property "${propertyName}" added in real-time`)
        break
      case 'property_updated':
        this.toastStore.info(`Property "${propertyName}" updated in real-time`)
        break
      case 'property_deleted':
        this.toastStore.warning(`Property "${propertyName}" was removed`)
        break
    }
  }

  // Handle reconnection logic
  private handleReconnect(): void {
    if (this.connection.reconnectAttempts < this.connection.maxReconnectAttempts) {
      this.connection.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.connection.reconnectAttempts), 30000)
      
      console.log(`Attempting to reconnect SSE in ${delay}ms (attempt ${this.connection.reconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      console.error('Max SSE reconnection attempts reached')
      this.toastStore.error('Lost connection to real-time updates')
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.connection.isConnected
  }

  // Simulate property update (for testing)
  simulatePropertyUpdate(type: PropertyUpdateEvent['type'], property: PropertyUpdateEvent['property']): void {
    const event: PropertyUpdateEvent = { type, property }
    this.handlePropertyUpdate(event)
  }
}

// Create and export singleton instance
export const sseService = new SSEService()

// Export the class for testing
export default SSEService
