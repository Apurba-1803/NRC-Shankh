# Shade Card Approval Notification System

## Overview

This notification system monitors shade card approval dates across all jobs and alerts Admin and Planner users when shade card approvals are approaching their 180-day expiry (30 days or less before expiry) or have already expired.

## Features

### 1. **Automatic Monitoring**

- Continuously monitors all jobs with shade card approval dates
- Checks if shade card approvals are within 30 days of their 180-day expiry
- Identifies overdue approvals (past the 180-day validity period)

### 2. **Multiple Notification Interfaces**

#### A. Notification Bell (Header)

- **Location**: Top-right corner of the header
- **Visibility**: Admin and Planner roles only
- **Features**:
  - Real-time notification count badge
  - Animated pulse effect for active notifications
  - Auto-refreshes every 5 minutes
  - Click to view detailed notification modal

#### B. Dashboard Widgets

- **Location**: Main dashboard for both Admin and Planner
- **Features**:
  - Summary statistics (Overdue, Urgent ≤7 days, Warning 8-30 days)
  - Top 3 most urgent notifications preview
  - Quick access to full notification list
  - Color-coded priority indicators

#### C. Detailed Notification Modal

- **Features**:
  - Complete list of all notifications
  - Filterable by status (All, Overdue, Urgent)
  - Detailed job information including:
    - NRC Job Number
    - Customer Name
    - Shade Card Approval Date
    - Days Remaining/Overdue
    - Job Priority (High/Medium/Low)
    - PO Number and Unit

## Priority Levels

The system categorizes notifications into four priority levels:

| Priority    | Days Remaining Until 180-day Expiry | Color      | Label   |
| ----------- | ----------------------------------- | ---------- | ------- |
| **Overdue** | < 0 (past expiry)                   | Red        | OVERDUE |
| **Urgent**  | 0-7                                 | Red/Orange | URGENT  |
| **Warning** | 8-15                                | Orange     | WARNING |
| **Notice**  | 16-30                               | Yellow     | NOTICE  |

## Technical Implementation

### Files Created

1. **Service Layer**

   - `src/services/shadeCardNotificationService.ts`
     - Fetches jobs with shade card approval dates
     - Calculates days remaining
     - Filters notifications based on criteria
     - Provides utility functions for priority calculation

2. **Components**

   - `src/Components/common/NotificationBell.tsx`

     - Header notification bell with badge count
     - Auto-refresh every 5 minutes

   - `src/Components/common/ShadeCardNotifications.tsx`

     - Full-featured notification modal
     - Filtering and sorting capabilities

   - `src/Components/common/ShadeCardNotificationWidget.tsx`
     - Dashboard widget with summary statistics
     - Preview of top 3 urgent notifications

### Modified Files

1. **Header Component**

   - `src/Components/Navbar/Header/Header.tsx`
     - Added notification bell for Admin and Planner roles
     - Available on both desktop and mobile views

2. **Admin Dashboard**

   - `src/Components/Roles/Admin/AdminDashboard.tsx`
     - Integrated notification widget below statistics grid

3. **Planner Dashboard**
   - `src/Components/Roles/Admin/Planner/PlannerDashboard.tsx`
     - Integrated notification widget after summary cards

## API Integration

### Endpoint Used

```
GET https://nrprod.nrcontainers.com/api/jobs/
```

### Required Fields from Job Data

- `nrcJobNo` - Job number
- `customerName` - Customer name
- `shadeCardApprovalDate` - Approval date (ISO string)
- `jobDemand` - Priority level (high/medium/low)
- `poNumber` - Purchase order number (optional)
- `unit` - Unit information (optional)

### Authentication

Uses Bearer token from `localStorage.getItem('accessToken')`

## User Experience

### For Admin Users

1. **Header**: See notification count badge
2. **Dashboard**: View notification widget with summary
3. **Click Badge/Widget**: Open detailed notification modal
4. **Filter**: View all, overdue, or urgent notifications
5. **Take Action**: Navigate to relevant jobs to update shade card approvals

### For Planner Users

Same experience as Admin users - full access to notification system

## Auto-Refresh Behavior

- **Header Bell**: Refreshes every 5 minutes
- **Dashboard Widget**: Refreshes every 5 minutes
- **Manual Refresh**: Click "Refresh" button in notification modal

## Notification Criteria

A notification is created when:

1. Job has a `shadeCardApprovalDate` field
2. Days until 180-day expiry ≤ 30 days
3. Includes both future expiry dates and overdue approvals

Example scenarios (assuming 180-day validity):

- ✅ Shade card approved 150 days ago → Shows notification (30 days until expiry - WARNING)
- ✅ Shade card approved 175 days ago → Shows notification (5 days until expiry - URGENT)
- ✅ Shade card approved 185 days ago → Shows notification (5 days overdue - OVERDUE)
- ❌ Shade card approved 120 days ago → No notification (60 days until expiry)
- ❌ No approval date set → No notification

## Color Coding

### Background Colors

- **Red** (`bg-red-50/100`): Overdue notifications
- **Orange** (`bg-orange-50/100`): Urgent (≤7 days)
- **Yellow** (`bg-yellow-50/100`): Warning (8-30 days)
- **Green** (`bg-green-50/100`): All up to date (no notifications)

### Border Indicators

- **Red Border** (`border-red-600`): Overdue
- **Orange Border** (`border-orange-600`): Urgent
- **Yellow Border** (`border-yellow-600`): Warning/Notice

## Mobile Responsiveness

All notification components are fully responsive:

- ✅ Works on desktop, tablet, and mobile devices
- ✅ Touch-friendly click targets
- ✅ Adaptive layouts
- ✅ Scrollable notification lists

## Performance Considerations

- Notifications are cached and refreshed periodically
- API calls are debounced to prevent excessive requests
- Filters are applied client-side for instant response
- Lazy loading for large notification lists

## Future Enhancements (Potential)

1. Email notifications for overdue approvals
2. Push notifications
3. Custom notification preferences per user
4. Bulk update capability
5. Notification history/archive
6. Export notification reports
7. Integration with calendar reminders

## Troubleshooting

### Notifications not showing

- Check if user is Admin or Planner role
- Verify `accessToken` is present in localStorage
- Check if jobs have `shadeCardApprovalDate` field populated
- Verify API endpoint is accessible

### Count is incorrect

- Click "Refresh" button in notification modal
- Check browser console for API errors
- Verify date calculations are correct

### Widget not displaying

- Check if component is imported correctly
- Verify user has proper role permissions
- Check for console errors

## Support

For issues or questions about the notification system, contact the development team.

---

**Last Updated**: October 2025
**Version**: 1.0
