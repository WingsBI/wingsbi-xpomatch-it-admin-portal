# 🚀 API Integration Guide - Xpo Match IT Admin Portal

## Overview
This project implements a complete API integration solution using modern technologies like Redux Toolkit with RTK Query, providing seamless data management and real-time updates.

## 🛠️ Technologies Used

### Core Technologies
- **Redux Toolkit (RTK)**: State management with modern patterns
- **RTK Query**: Data fetching and caching solution
- **JWT Token Management**: Secure authentication with automatic refresh
- **TypeScript**: Full type safety across the application
- **Material-UI**: Modern, responsive UI components

### Advanced Features
- **Automatic Token Refresh**: Seamless authentication experience
- **Optimistic Updates**: Instant UI feedback
- **Background Refetching**: Keep data fresh automatically
- **Error Handling**: Comprehensive error management
- **Caching Strategy**: Intelligent data caching with tags

## 📁 Project Structure

```
src/
├── lib/
│   ├── store/
│   │   ├── index.ts              # Main store configuration
│   │   ├── api/
│   │   │   ├── baseApi.ts        # Base API configuration
│   │   │   ├── authApi.ts        # Authentication endpoints
│   │   │   ├── eventsApi.ts      # Events CRUD operations
│   │   │   └── adminApi.ts       # Admin management endpoints
│   │   └── slices/
│   │       └── authSlice.ts      # Authentication state management
│   ├── hooks/
│   │   └── useAuth.ts            # Custom authentication hook
│   └── utils/
│       └── tokenUtils.ts         # JWT token utilities
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx    # Route protection component
│   └── providers/
│       └── ReduxProvider.tsx     # Redux store provider
└── app/
    ├── page.tsx                  # Login page with API integration
    └── it-admin/
        └── dashboard/
            └── page.tsx          # Dashboard with API data
```

## 🔧 Configuration

### Environment Variables
Create `.env.local` file:
```bash
NEXT_PUBLIC_API_BASE_URL=https://xpomatch-dev-it-admin-api.azurewebsites.net
```

### API Base Configuration
The base API is configured with:
- Automatic JWT token injection
- Token refresh on 401 responses
- Request/response interceptors
- Error handling middleware

## 🔐 Authentication Flow

### Login Process
1. User submits credentials
2. API call to `/api/Auth/login`
3. Store JWT token and refresh token
4. Decode token to extract user profile
5. Update application state
6. Redirect to dashboard

### Token Management
- **Automatic Injection**: JWT token added to all requests
- **Refresh Logic**: Automatic token refresh on expiration
- **Secure Storage**: Tokens stored in localStorage with validation
- **Cleanup**: Automatic cleanup on logout

## 📊 API Endpoints

### Authentication (`authApi.ts`)
```typescript
// Login
POST /api/Auth/login
{
  "email": "ritesh@yopmail.com",
  "password": "string"
}

// Response
{
  "statusCode": 200,
  "message": "Login successful",
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "r0KG6wWdozv9TwkXhKoI..."
  }
}

// Token Refresh
POST /api/Auth/refresh
{
  "refreshToken": "refresh_token_here"
}
```

### Events Management (`eventsApi.ts`)
```typescript
GET    /api/Events              // Get all events
GET    /api/Events/{id}         // Get single event
POST   /api/Events              // Create new event
PUT    /api/Events/{id}         // Update event
DELETE /api/Events/{id}         // Delete event
GET    /api/Events/search       // Search events
```

### Admin Management (`adminApi.ts`)
```typescript
GET    /api/Admin/users         // Get all admin users
GET    /api/Admin/users/{id}    // Get single admin
POST   /api/Admin/users         // Create admin user
PUT    /api/Admin/users/{id}    // Update admin user
DELETE /api/Admin/users/{id}    // Delete admin user
GET    /api/Admin/roles         // Get available roles
GET    /api/Admin/dashboard/stats // Dashboard statistics
```

## 🎯 Usage Examples

### Using Authentication Hook
```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function LoginComponent() {
  const { login, logout, user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      // Login successful
    } else {
      // Handle error: result.error
    }
  };
}
```

### Using API Queries
```typescript
import { useGetEventsQuery, useCreateEventMutation } from '@/lib/store/api/eventsApi';

function EventsComponent() {
  // Fetch events with caching
  const { data, isLoading, error, refetch } = useGetEventsQuery();
  
  // Create event mutation
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  
  const handleCreateEvent = async (eventData) => {
    try {
      await createEvent(eventData).unwrap();
      // Event created successfully
    } catch (error) {
      // Handle error
    }
  };
}
```

### Protected Routes
```typescript
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

## 🚀 Advanced Features

### RTK Query Benefits
- **Automatic Caching**: Data cached with intelligent invalidation
- **Background Updates**: Refetch data on window focus/reconnection
- **Optimistic Updates**: Instant UI feedback for mutations
- **Loading States**: Built-in loading and error state management
- **Type Safety**: Full TypeScript integration

### Error Handling
- Global error handling in base API
- Automatic token refresh on 401 errors
- User-friendly error messages
- Network error recovery

### Performance Optimizations
- Selective re-rendering with RTK Query
- Automatic deduplication of identical requests
- Intelligent cache invalidation
- Background data synchronization

## 🔒 Security Features

### Token Security
- JWT tokens stored securely
- Automatic token validation
- Secure token refresh mechanism
- Cleanup on logout

### Route Protection
- Protected route components
- Role-based access control
- Automatic redirects for unauthorized access
- Authentication state persistence

## 🎨 UI Integration

### Real-time Updates
- Live data synchronization
- Automatic refresh on focus
- Loading states and progress indicators
- Error boundaries and fallbacks

### User Experience
- Seamless authentication flow
- Instant feedback on actions
- Responsive design patterns
- Accessibility compliance

## 📝 Development Tips

### Testing API Integration
1. Check browser DevTools for network requests
2. Monitor Redux DevTools for state changes
3. Use the API endpoints directly for debugging
4. Verify token storage in localStorage

### Adding New Endpoints
1. Add types to respective API file
2. Create endpoint in RTK Query slice
3. Export hooks for component usage
4. Add proper TypeScript types

### Error Debugging
- Check console for RTK Query logs
- Verify API response format
- Test with Postman/curl
- Monitor network tab in DevTools

## 🚀 Getting Started

1. **Install dependencies**: `npm install`
2. **Set environment variables**: Create `.env.local`
3. **Run development server**: `npm run dev`
4. **Test login**: Use provided credentials
5. **Explore dashboard**: View real-time API data

## 📚 Additional Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [RTK Query Guide](https://redux-toolkit.js.org/rtk-query/overview)
- [JWT.io Token Debugger](https://jwt.io/)
- [Material-UI Components](https://mui.com/)

---

**Note**: This integration provides a production-ready foundation for API management with modern React patterns and advanced state management capabilities. 