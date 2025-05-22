# Authentication Components

This directory contains components and utilities for handling authentication and protected routes in the BizList application.

## Components

### 1. ProtectedRoute

The original protected route component that has been improved to prevent content flashing.

```tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### 2. AuthGuard

A more flexible component that can be used to protect routes with additional options.

```tsx
import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminPage() {
  return (
    <AuthGuard adminOnly>
      <div>Admin only content</div>
    </AuthGuard>
  );
}
```

### 3. AuthVerifying

A loading component that is shown while authentication is being verified.

```tsx
import AuthVerifying from "@/components/auth/AuthVerifying";

// Custom loading message
<AuthVerifying message="Checking permissions..." />;
```

## Utilities

### 1. withAuth HOC

A higher-order component that can be used to protect entire pages.

```tsx
import withAuth from "@/components/auth/withAuth";

function AdminDashboard() {
  return <div>Admin dashboard</div>;
}

export default withAuth(AdminDashboard, { adminOnly: true });
```

### 2. useProtectedRoute Hook

A hook that can be used to protect routes at the component level.

```tsx
import useProtectedRoute from "@/components/auth/useProtectedRoute";

export default function ProtectedComponent() {
  const { isAuthorized, isLoading } = useProtectedRoute();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return null; // This will never render because the hook will redirect
  }

  return <div>Protected content</div>;
}
```

## Options

All protection components and utilities accept the following options:

- `adminOnly`: Only allow admin users to access the route
- `providerOnly`: Only allow provider users to access the route
- `redirectPath`: Custom path to redirect to if authentication fails
- `fallback`: Custom component to show while authentication is being verified

## Implementation Notes

These components solve the issue of content flashing before redirection by:

1. Using a loading state while authentication is being verified
2. Only rendering the protected content after authentication is confirmed
3. Providing a smooth transition with a branded loading indicator
