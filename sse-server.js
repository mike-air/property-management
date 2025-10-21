import express from 'express'
import cors from 'cors'
import fs from 'fs'

const app = express()
const PORT = 3002

// Middleware
app.use(cors())
app.use(express.json())

// Store connected clients
const clients = new Set()

// Read database to get actual property IDs
function getDatabaseProperties() {
  try {
    const data = fs.readFileSync('db.json', 'utf8')
    const db = JSON.parse(data)
    return db.properties || []
  } catch (error) {
    console.error('Error reading database:', error)
    return []
  }
}

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

// Simulate property updates every 30 seconds using actual properties
setInterval(() => {
  const properties = getDatabaseProperties()
  
  if (properties.length === 0) {
    console.log('No properties found in database')
    return
  }
  
  const updateTypes = ['property_updated'] // Only update existing properties
  const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)]
  
  // Pick a random existing property
  const randomProperty = properties[Math.floor(Math.random() * properties.length)]
  
  // Create a slight modification to simulate an update
  const updatedProperty = {
    ...randomProperty,
    price: randomProperty.price + Math.floor(Math.random() * 100) - 50, // Small price change
    updatedAt: new Date().toISOString()
  }

  const event = {
    type: randomType,
    property: updatedProperty
  }

  console.log(`Broadcasting ${randomType} event: Property ${updatedProperty.id}`)
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



app.listen(PORT, () => {
  console.log(`SSE Server running on http://localhost:${PORT}`)
  console.log(`SSE endpoint: http://localhost:${PORT}/api/events`)
  console.log(`Manual trigger: POST http://localhost:${PORT}/api/events/trigger`)
})
