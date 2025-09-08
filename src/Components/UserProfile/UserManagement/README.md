# User Management System

This directory contains the complete user management functionality for the NR Containers application.

## 🏗️ Architecture

The user management system is built with a modular, component-based architecture:

```
UserManagement/
├── types.ts              # Shared TypeScript interfaces and utilities
├── UserDetailsPage.tsx   # Main page displaying all users
├── UserDetailsModal.tsx  # Modal showing individual user details
├── EditUserModal.tsx     # Modal for editing user information
├── DeleteWarningModal.tsx # Confirmation modal for user deletion
├── index.ts              # Barrel export file
└── README.md             # This documentation
```

## 🚀 Features

### 1. **Create New ID** (`CreateNewId.tsx`)
- **Location**: `../Options/CreateNewId.tsx`
- **API Endpoint**: `POST https://nrprod.nrcontainers.com/api/auth/add-member`
- **Payload Format**:
  ```typescript
  {
    email: string;
    password: string;
    roles: string[];
    firstName: string;
    lastName: string;
  }
  ```
- **Features**:
  - Multi-select role grid with visual feedback
  - Blue background for selected roles, pink/purple for unselected
  - Selected roles display at bottom
  - Form validation and error handling
  - Success message and auto-close

### 2. **User Details Page** (`UserDetailsPage.tsx`)
- **API Endpoint**: `GET https://nrprod.nrcontainers.com/api/auth/users`
- **Features**:
  - Displays all users in responsive card format
  - Search functionality (by ID, Name, or Email)
  - Each card shows: Name, Email, Roles, Active status, Timestamps
  - Action buttons: View, Edit, Delete
  - Empty state handling

### 3. **User Details Modal** (`UserDetailsModal.tsx`)
- **Features**:
  - Comprehensive user information display
  - Action buttons: Close, Edit User, Delete User
  - Responsive design with proper spacing

### 4. **Edit User Modal** (`EditUserModal.tsx`)
- **API Endpoint**: `PUT https://nrprod.nrcontainers.com/api/auth/users/{id}`
- **Payload Format**:
  ```typescript
  {
    name: string;
    email: string;
    phone?: string;
    roles: string[];
    password?: string; // Optional, only if changing
  }
  ```
- **Features**:
  - Pre-filled form with current user data
  - Multi-select role grid (same as Create New ID)
  - Optional password update
  - Form validation and error handling

### 5. **Delete Warning Modal** (`DeleteWarningModal.tsx`)
- **API Endpoint**: `DELETE https://nrprod.nrcontainers.com/api/auth/users/{id}`
- **Features**:
  - Clear warning message about permanent deletion
  - User details display for confirmation
  - Loading state during deletion
  - Error handling

## 🔧 API Integration

### Authentication
All API calls require a valid `accessToken` from localStorage:
```typescript
const accessToken = localStorage.getItem('accessToken');
if (!accessToken) throw new Error('Authentication token not found.');

headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

### Error Handling
- Network errors are caught and displayed to users
- API error responses are parsed and shown
- Loading states prevent multiple submissions

## 🎨 UI/UX Features

### Role Selection Grid
- **Selected**: Blue background (`bg-[#00AEEF]`) with white text and checkmark
- **Unselected**: Light purple/pink background (`bg-purple-100`) with dark text
- **Hover Effects**: Smooth transitions and hover states
- **Responsive**: 2-column grid that adapts to screen size

### Modal Design
- **Backdrop**: Semi-transparent black with blur effect
- **Headers**: Consistent styling with icons and titles
- **Content**: Scrollable content area for long forms
- **Actions**: Clear button hierarchy and spacing

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Proper touch targets
- Consistent spacing and typography

## 📱 Navigation Integration

### Sidebar Options
- **Admin Role**: "Create new ID", "User Details", "Edit Machine"
- **Planner Role**: "Edit Machine" (for machine assignments)

### Routing
- **Create New ID**: Opens as modal overlay
- **User Details**: Navigates to `/dashboard/user-details`
- **Edit Machine**: Navigates to `/dashboard/edit-machine`

## 🔒 Security Features

### Role-Based Access
- Only Admin users can access user management
- Role validation on both frontend and backend
- Proper permission checks before actions

### Data Validation
- Required field validation
- Email format validation
- Role selection requirements
- Password strength (if implemented)

## 🚀 Usage Examples

### Creating a New User
1. Click "Create new ID" in admin sidebar
2. Fill in form fields (First Name, Last Name, Phone, Email, Password)
3. Select one or more roles from the grid
4. Click "Create ID"
5. Success message appears, modal closes automatically

### Viewing All Users
1. Click "User Details" in admin sidebar
2. Page loads with all users displayed as cards
3. Use search bar to filter users
4. Click "View" on any card to see details

### Editing a User
1. From user details page, click "Edit" on any user card
2. Modal opens with pre-filled current data
3. Make changes to any fields
4. Select/deselect roles as needed
5. Optionally set new password
6. Click "Save Changes"

### Deleting a User
1. From user details page, click "Delete" on any user card
2. Warning modal appears with user details
3. Confirm deletion by clicking "Delete User"
4. User is permanently removed from system

## 🐛 Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check if accessToken is valid and not expired
2. **Role Selection**: Ensure at least one role is selected
3. **Form Validation**: All required fields must be filled
4. **API Errors**: Check network connectivity and backend status

### Debug Information
- Console logs for API responses
- Error messages displayed to users
- Loading states for user feedback

## 🔮 Future Enhancements

### Potential Improvements
1. **Bulk Operations**: Select multiple users for batch actions
2. **Advanced Search**: Filter by role, status, creation date
3. **User Activity Logs**: Track login history and actions
4. **Role Templates**: Predefined role combinations
5. **Password Policies**: Enforce strong password requirements
6. **Two-Factor Authentication**: Additional security layer

## 📚 Dependencies

### Required Packages
- `react`: Core React library
- `lucide-react`: Icon library
- `tailwindcss`: Styling framework

### Browser Support
- Modern browsers with ES6+ support
- Responsive design for mobile and desktop
- Touch-friendly interactions

---

**Note**: This system integrates with the existing authentication and routing infrastructure. Ensure proper testing in development before deploying to production. 