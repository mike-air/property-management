const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = 3002

// Middleware
app.use(cors())
app.use(express.json())

// Store connected clients
const clients = new Set()

// SSE endpoint
app.get('/api/events', (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  })

  // Add client to set
  clients.add(res)

  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    type: 'connection',
    message: 'Connected to real-time updates'
  })}\n\n`)

  // Handle client disconnect
  req.on('close', () => {
    clients.delete(res)
    console.log('Client disconnected from SSE')
  })

  console.log('New client connected to SSE')
})

// Broadcast function
function broadcastToClients(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`
  
  clients.forEach(client => {
    try {
      client.write(message)
    } catch (error) {
      console.error('Error sending SSE message:', error)
      clients.delete(client)
    }
  })
}

// Simulate property updates every 30 seconds
setInterval(() => {
  const updateTypes = ['property_created', 'property_updated']
  const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)]
  
  const mockProperty = {
    id: Math.floor(Math.random() * 1000),
    name: `Property ${Math.floor(Math.random() * 100)}`,
    type: Math.random() > 0.5 ? 'rental' : 'sale',
    owner: `Owner ${Math.floor(Math.random() * 100)}`,
    price: Math.floor(Math.random() * 500000) + 100000,
    status: Math.random() > 0.5 ? 'available' : 'occupied',
    latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
    longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
    description: 'Auto-generated property for testing',
    bedrooms: Math.floor(Math.random() * 5) + 1,
    bathrooms: Math.floor(Math.random() * 3) + 1,
    squareFeet: Math.floor(Math.random() * 2000) + 500,
    address: `${Math.floor(Math.random() * 9999)} Test Street`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const event = {
    type: randomType,
    property: mockProperty
  }

  console.log(`Broadcasting ${randomType} event:`, mockProperty.name)
  broadcastToClients(event)
}, 30000) // Every 30 seconds

// Manual trigger endpoint for testing
app.post('/api/events/trigger', (req, res) => {
  const { type, property } = req.body
  
  if (!type || !property) {
    return res.status(400).json({ error: 'Missing type or property data' })
  }

  const event = { type, property }
  console.log(`Manual trigger: ${type} event for property:`, property.name)
  broadcastToClients(event)
  
  res.json({ success: true, message: 'Event broadcasted' })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    connectedClients: clients.size,
    uptime: process.uptime()
  })
})

app.listen(PORT, () => {
  console.log(`SSE Server running on http://localhost:${PORT}`)
  console.log(`SSE endpoint: http://localhost:${PORT}/api/events`)
  console.log(`Manual trigger: POST http://localhost:${PORT}/api/events/trigger`)
})
