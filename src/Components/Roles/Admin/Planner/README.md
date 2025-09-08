# Planner Dashboard

A comprehensive, visually aesthetic dashboard for Production Planners to monitor job statuses and progress at a glance.

## 🎯 **Overview**

The Planner Dashboard provides Production Planners with a quick overview of all jobs, their completion statuses, and progress tracking. It displays data from the `/api/planner-dashboard` endpoint in an intuitive, interactive interface.

## ✨ **Features**

### **1. Summary KPI Cards**
- **Total Jobs**: Shows the total number of active jobs
- **Fully Completed**: Jobs with 100% completion across all stages
- **Partially Completed**: Jobs with some stages completed
- **Not Started**: Jobs that haven't begun any stages

### **2. Interactive Charts**
- **Pie Chart**: Job distribution by completion status (Fully, Partially, Not Started)
- **Bar Chart**: Comparison of completion statuses across PO, Machine Details, and Artwork

### **3. Advanced Filtering**
- **Customer Filter**: Search jobs by customer name
- **Status Filter**: Filter by job status (Active, Completed)
- **Progress Filter**: Filter by progress ranges (High: 80%+, Medium: 40-79%, Low: 0-39%)

### **4. Sortable Job Table**
- **Sortable Columns**: Click any column header to sort
- **Progress Bars**: Visual progress indicators with color coding
- **Status Badges**: Clear status indicators with icons
- **Responsive Design**: Works on all screen sizes

## 🏗️ **Architecture**

### **Components Structure**
```
PlannerDashboardContainer.tsx  ← Main container with data fetching
├── PlannerDashboard.tsx       ← Main dashboard UI
└── plannerService.ts          ← API service layer
```

### **Data Flow**
1. **Container** fetches data from API
2. **Service** handles API calls and error handling
3. **Dashboard** renders UI with charts and tables
4. **User interactions** trigger filtering and sorting

## 🔌 **API Integration**

### **Endpoint**
```
GET https://nrc-backend-his4.onrender.com/api/planner-dashboard
```

### **Response Structure**
```typescript
{
  "success": true,
  "data": {
    "summary": {
      "totalJobs": number,
      "poCompleted": number,
      "machineDetailsCompleted": number,
      "artworkCompleted": number,
      "fullyCompleted": number,
      "partiallyCompleted": number,
      "notStarted": number
    },
    "jobs": PlannerJob[]
  }
}
```

### **Job Data Structure**
```typescript
interface PlannerJob {
  nrcJobNo: string;
  styleItemSKU: string;
  customerName: string;
  status: string;
  poStatus: string;
  machineDetailsStatus: string;
  artworkStatus: string;
  overallProgress: number;
  createdAt: string | null;
  updatedAt: string;
  poCount: number;
  artworkCount: number;
  hasMachineDetails: boolean;
}
```

## 🎨 **UI/UX Features**

### **Visual Design**
- **Modern Card Layout**: Clean, rounded cards with subtle shadows
- **Color Coding**: Intuitive color scheme for statuses and progress
- **Responsive Grid**: Adapts to different screen sizes
- **Smooth Transitions**: Hover effects and loading animations

### **Interactive Elements**
- **Hover Effects**: Table rows and buttons respond to user interaction
- **Sort Indicators**: Clear visual feedback for sortable columns
- **Progress Bars**: Animated progress indicators with color coding
- **Filter Controls**: Real-time filtering with immediate results

### **Accessibility**
- **Semantic HTML**: Proper table structure and labels
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast**: Clear visual hierarchy and readable text

## 🚀 **Performance Optimizations**

### **Code Optimization**
- **useMemo**: Chart data preparation and job processing
- **Efficient Filtering**: Optimized filter algorithms
- **Lazy Loading**: Charts render only when needed
- **Minimal Re-renders**: Smart state management

### **Bundle Optimization**
- **Tree Shaking**: Only imports used components
- **Code Splitting**: Separate bundle for dashboard
- **Minimal Dependencies**: Only essential packages

## 📱 **Responsive Design**

### **Breakpoints**
- **Mobile**: Single column layout, stacked cards
- **Tablet**: Two-column grid for charts
- **Desktop**: Full four-column KPI layout
- **Large Screens**: Optimized spacing and typography

### **Mobile Features**
- **Touch-Friendly**: Large touch targets for mobile
- **Swipe Support**: Horizontal scrolling for tables
- **Optimized Charts**: Responsive chart sizing
- **Mobile Navigation**: Easy access to all features

## 🔧 **Technical Implementation**

### **Dependencies**
- **React**: Core framework
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Chart library for data visualization
- **Heroicons**: Icon library

### **State Management**
- **Local State**: Component-level state for UI interactions
- **Filter State**: Manages active filters and search terms
- **Sort State**: Handles table sorting configuration
- **Loading State**: Manages API call states

### **Error Handling**
- **API Errors**: Graceful fallbacks for failed requests
- **Network Issues**: Retry mechanisms and user feedback
- **Data Validation**: Type checking and error boundaries
- **User Feedback**: Clear error messages and recovery options

## 🎯 **Usage Examples**

### **Basic Usage**
```typescript
import PlannerDashboardContainer from './PlannerDashboardContainer';

// In your component
<PlannerDashboardContainer />
```

### **Custom Data**
```typescript
import PlannerDashboard from './PlannerDashboard';

// With custom data
<PlannerDashboard data={customData} />
```

### **Service Usage**
```typescript
import { plannerService } from './plannerService';

// Fetch dashboard data
const data = await plannerService.getPlannerDashboard();

// Filter jobs by customer
const customerJobs = await plannerService.getJobsByCustomer('VIP CLOTHING LTD');

// Get jobs by progress range
const highProgressJobs = await plannerService.getJobsByProgress(80, 100);
```

## 🔍 **Troubleshooting**

### **Common Issues**
1. **Charts Not Rendering**: Check if recharts is installed
2. **API Errors**: Verify authentication token and network connectivity
3. **Performance Issues**: Check for large datasets and optimize filters
4. **Mobile Issues**: Test responsive breakpoints and touch interactions

### **Debug Mode**
Enable console logging for debugging:
```typescript
// Add to component for debugging
console.log('Dashboard Data:', data);
console.log('Filtered Jobs:', processedJobs);
```

## 🚀 **Future Enhancements**

### **Planned Features**
- **Real-time Updates**: WebSocket integration for live data
- **Export Functionality**: PDF/Excel export of job data
- **Advanced Analytics**: Trend analysis and forecasting
- **Custom Dashboards**: User-configurable layouts
- **Notification System**: Alerts for job status changes

### **Performance Improvements**
- **Virtual Scrolling**: Handle large job lists efficiently
- **Data Caching**: Implement smart caching strategies
- **Lazy Loading**: Progressive loading for better UX
- **Optimized Charts**: Reduce chart rendering overhead

## 📄 **License**

This component is part of the NR Containers application and follows the project's licensing terms.

## 🤝 **Contributing**

To contribute to the Planner Dashboard:
1. Follow the project's coding standards
2. Add comprehensive TypeScript types
3. Include responsive design considerations
4. Test across different devices and browsers
5. Update this documentation for any changes 