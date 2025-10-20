import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { useToastStore } from '../stores/toast'

// API Base URL
const API_BASE_URL = 'http://localhost:3001'

// Types
export interface User {
  id: number
  email: string
  password: string
  token: string
}

export interface PropertyImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

export interface Property {
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
  images?: PropertyImage[]
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: Omit<User, 'password'>
}

export interface CreatePropertyRequest {
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
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  id: number
}

export interface PropertiesResponse {
  data: Property[]
  total: number
  page: number
  limit: number
}

// API Service Class
class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const toastStore = useToastStore()

        if (error.response?.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('auth_token')
          toastStore.error('Session expired. Please log in again.')
          window.location.href = '/login'
        } else if (error.response?.status >= 500) {
          toastStore.error('Server error. Please try again later.')
        } else if (error.response?.status >= 400) {
          const message = error.response?.data?.message || error.message || 'Request failed'
          toastStore.error(`Request failed: ${message}`)
        } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
          toastStore.error('Network error. Please check your connection.')
        } else if (error.code === 'ECONNABORTED') {
          toastStore.error('Request timeout. Please try again.')
        }

        return Promise.reject(error)
      },
    )
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // For JSON Server, we'll simulate login by finding the user
    const usersResponse: AxiosResponse<User[]> = await this.api.get('/users')
    const user = usersResponse.data.find(
      (u) => u.email === credentials.email && u.password === credentials.password,
    )

    if (!user) {
      throw new Error('Invalid credentials')
    }

    return {
      token: user.token,
      user: {
        id: user.id,
        email: user.email,
        token: user.token,
      },
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token')
  }

  // Properties endpoints
  async getProperties(params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    type?: 'rental' | 'sale'
    status?: 'available' | 'occupied'
  }): Promise<PropertiesResponse> {
    const response: AxiosResponse<Property[]> = await this.api.get('/properties', { params })

    // JSON Server doesn't provide pagination metadata, so we'll simulate it
    const total = response.data.length
    const page = params?.page || 1
    const limit = params?.limit || 10

    return {
      data: response.data,
      total,
      page,
      limit,
    }
  }

  async getProperty(id: number): Promise<Property> {
    const response: AxiosResponse<Property> = await this.api.get(`/properties/${id}`)
    return response.data
  }

  async createProperty(property: CreatePropertyRequest): Promise<Property> {
    const response: AxiosResponse<Property> = await this.api.post('/properties', property)
    return response.data
  }

  async updateProperty(id: number, property: Partial<CreatePropertyRequest>): Promise<Property> {
    const response: AxiosResponse<Property> = await this.api.put(`/properties/${id}`, property)
    return response.data
  }

  async deleteProperty(id: number): Promise<void> {
    await this.api.delete(`/properties/${id}`)
  }

  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }
}

// Create and export a singleton instance
export const apiService = new ApiService()

// Export the class for testing purposes
export default ApiService
