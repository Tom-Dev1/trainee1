# E-commerce CMS

A modern, responsive E-commerce Content Management System built with React, TypeScript, and Ant Design.

## 🚀 Features

- **Dashboard**: Overview with key statistics and metrics
- **Product Management**: Full CRUD operations with pagination, search, and filtering
- **Category Management**: Hierarchical category tree structure with nested categories
- **Order Management**: View and manage customer orders with detailed item breakdown
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Responsive Design**: Mobile-friendly interface using Ant Design components
- **Mock API**: MSW (Mock Service Worker) for realistic API simulation
- **Local Storage**: CRUD operations sync with localStorage after initial fetch
- **Slug Generation**: Automatic URL-friendly slug generation for products and categories
- **Type Safety**: Full TypeScript implementation with strict type checking

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **UI Library**: Ant Design v5
- **Routing**: React Router DOM
- **State Management**: TanStack Query + Context API
- **API Mocking**: Mock Service Worker (MSW)
- **Testing**: Jest + React Testing Library
- **Data Visualization**: Reaviz (ready for charts)
- **Icons**: React Icons + Ant Design Icons

## 📁 Project Structure

```
src/
├── components/
│   └── Layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── MainLayout.tsx
├── contexts/
│   └── ThemeContext.tsx
├── mocks/
│   ├── browser.ts
│   └── handlers.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── Products/
│   │   ├── ProductList.tsx
│   │   └── ProductDetail.tsx
│   ├── Categories/
│   │   ├── CategoryList.tsx
│   │   └── CategoryDetail.tsx
│   └── Orders/
│       └── OrderList.tsx
├── services/
│   ├── api.ts
│   └── localStorage.ts
├── types/
│   └── index.ts
├── utils/
│   └── slug.ts
└── __tests__/
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-cms
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5174`

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## 🧪 Testing

The project includes comprehensive tests using Jest and React Testing Library:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🎨 Features Overview

### Dashboard
- Real-time statistics display
- Key metrics: Total Products, Orders, Revenue, Categories
- Responsive card layout

### Product Management
- **List View**: Paginated table with search and category filtering
- **CRUD Operations**: Create, Read, Update, Delete products
- **Image Support**: Product image display and management
- **Status Management**: Active/Inactive product status
- **Detail View**: Individual product pages with slug-based routing

### Category Management
- **Hierarchical Structure**: Tree-based category organization
- **Nested Categories**: Support for parent-child relationships
- **CRUD Operations**: Full category management
- **Detail View**: Individual category pages with slug-based routing

### Order Management
- **Order Listing**: Paginated order table
- **Status Tracking**: Order status management
- **Item Details**: Expandable order item breakdown
- **Customer Information**: Customer details display

### Theme System
- **Dark/Light Mode**: Toggle between themes
- **Persistent Preference**: Theme choice saved to localStorage
- **Consistent Styling**: Theme applied across all components

## 🔧 Configuration

### Mock Service Worker (MSW)
The project uses MSW for API mocking. Mock data and handlers are configured in:
- `src/mocks/handlers.ts` - API endpoint handlers
- `src/mocks/browser.ts` - Browser worker setup

### Local Storage Integration
After the initial API fetch, all CRUD operations are managed through localStorage:
- Products: `ecommerce_products`
- Categories: `ecommerce_categories`

### Routing
The application uses React Router DOM with the following routes:
- `/dashboard` - Dashboard overview
- `/products` - Product list
- `/products/:slug` - Product detail
- `/categories` - Category list
- `/categories/:slug` - Category detail
- `/orders` - Order list

## 🎯 Key Implementation Details

### Slug Generation
Automatic slug generation for SEO-friendly URLs:
- Converts names to lowercase, URL-safe strings
- Ensures uniqueness across items
- Updates automatically when names change

### Type Safety
Comprehensive TypeScript implementation:
- Strict type checking enabled
- Interface definitions for all data models
- Type-safe API calls and state management

### Responsive Design
Mobile-first approach using Ant Design:
- Responsive grid system
- Mobile-friendly navigation
- Adaptive component sizing

## 🚀 Production Deployment

1. Build the project:
```bash
npm run build
```

2. The built files will be in the `dist` directory
3. Deploy to your preferred hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.