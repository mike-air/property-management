# Property Management System

A Vue 3 + TypeScript property management application with authentication, CRUD operations, and modern UI components.

## Features

- 🔐 **Authentication**: Login/logout with JWT tokens
- 🏠 **Property Management**: Create, read, update, delete properties
- 🔍 **Search & Filter**: Search properties by name, owner, type, and status
- 📊 **Sorting**: Sort properties by various fields
- 📄 **Pagination**: Navigate through property listings
- 🎨 **Modern UI**: Built with shadcn/ui components and TailwindCSS
- 🗺️ **Map Integration**: Property location display (placeholder for Leaflet)
- 📱 **Responsive**: Mobile-friendly design

## Tech Stack

- **Frontend**: Vue 3 (Composition API) + TypeScript
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **UI Components**: shadcn/ui + TailwindCSS
- **HTTP Client**: Axios
- **Mock API**: JSON Server
- **Build Tool**: Vite
- **Testing**: Playwright (E2E)

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start the mock API server** (in one terminal):

   ```bash
   npm run mock-api
   ```

   This starts JSON Server on http://localhost:3001

3. **Start the development server** (in another terminal):

   ```bash
   npm run dev
   ```

   This starts the Vue app on http://localhost:5173

4. **Open your browser** and navigate to http://localhost:5173

### Demo Credentials

- **Email**: admin@example.com
- **Password**: password

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run mock-api` - Start JSON Server mock API
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Endpoints

The mock API provides the following endpoints:

- `GET /users` - Get all users
- `GET /properties` - Get all properties
- `GET /properties/:id` - Get property by ID
- `POST /properties` - Create new property
- `PUT /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property

## Project Structure

```
src/
├── components/
│   └── ui/           # shadcn/ui components
├── stores/           # Pinia stores
│   ├── auth.ts      # Authentication store
│   ├── properties.ts # Properties store
│   └── toast.ts     # Toast notifications store
├── services/
│   └── api.ts       # API service layer
├── views/           # Page components
│   ├── LoginView.vue
│   ├── PropertiesView.vue
│   ├── PropertyDetailsView.vue
│   └── AddPropertyView.vue
├── router/
│   └── index.ts     # Vue Router configuration
└── App.vue          # Main app component
```

## Features Overview

### Authentication

- Secure login with email/password
- JWT token management
- Route guards for protected pages
- Automatic logout on token expiration

### Property Management

- **List View**: Paginated table with search, filter, and sort
- **Detail View**: View and edit property information
- **Add Property**: Create new property listings
- **Delete Property**: Remove properties with confirmation

### UI/UX

- Modern, clean design with shadcn/ui components
- Responsive layout for mobile and desktop
- Loading states and error handling
- Toast notifications for user feedback
- Form validation with error messages

## Next Steps

This is a foundation for a property management system. Potential enhancements:

1. **Maps Integration**: Add Leaflet maps for property locations
2. **Real-time Updates**: WebSocket/SSE for live updates
3. **File Uploads**: Property image management
4. **Advanced Search**: More sophisticated filtering options
5. **Reports**: Property analytics and reporting
6. **Multi-tenancy**: Support for multiple property managers

## Development Notes

- The app uses relative imports (`../`) instead of alias imports (`@/`) for better compatibility
- JSON Server provides a simple REST API for development
- All components are built with Vue 3 Composition API
- TypeScript provides type safety throughout the application
- TailwindCSS v4 is used for styling with the Vite plugin
