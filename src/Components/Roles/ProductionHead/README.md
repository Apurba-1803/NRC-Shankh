# Production Head Dashboard

A comprehensive dashboard for Production Head users to monitor and manage production operations in real-time.

## Features

### 🎯 Overview Tab
- **Key Metrics Cards**: Production efficiency, total quantity, active jobs, and team size
- **Production Steps Status**: Visual representation of all production steps (Corrugation, Flute Lamination, Punching, Flap Pasting)
- **Recent Activity**: Timeline of recent production activities
- **Real-time Updates**: Live data from production floor

### 📊 Production Details Tab
- **Job Selection**: Choose specific jobs to view detailed information
- **Step-by-step Details**: Comprehensive view of each production step
- **Status Tracking**: Monitor acceptance, pending, and rejection statuses
- **Quality Metrics**: Track quantities, wastage, and operator information

### 📈 Analytics Tab
- **Production Trends**: Visual charts for production performance
- **Efficiency Metrics**: Quality scores and wastage rates
- **Performance Indicators**: Average production times and success rates

## API Integration

The dashboard integrates with the following production endpoints:

- **Corrugation**: `/api/corrugation/by-job/{jobNo}`
- **Flute Lamination**: `/api/flute-laminate-board-conversion/by-job/{jobNo}`
- **Punching**: `/api/punching/by-job/{jobNo}`
- **Flap Pasting**: `/api/side-flap-pasting/by-job/{jobNo}`

## Usage

### For Production Heads
1. **Monitor Production**: View real-time status of all production steps
2. **Track Efficiency**: Monitor production efficiency and quality metrics
3. **Manage Operations**: Oversee multiple jobs and production lines
4. **Quality Control**: Track QC check statuses and operator performance

### For Operators
1. **Status Updates**: View current job status and requirements
2. **Quality Metrics**: Monitor wastage rates and production quantities
3. **Shift Information**: Track shift assignments and machine allocations

## Technical Details

### Components
- `ProductionHeadDashboard.tsx`: Main dashboard component
- `productionService.ts`: API service layer for production data

### State Management
- Real-time production data fetching
- Error handling and loading states
- Tab-based navigation system
- Responsive design for all screen sizes

### Styling
- Modern, clean UI using Tailwind CSS
- Responsive grid layouts
- Color-coded status indicators
- Smooth transitions and animations

## Getting Started

1. Ensure the backend API endpoints are accessible
2. Import the dashboard component in your routing system
3. Configure job selection based on user permissions
4. Customize the dashboard based on specific production requirements

## Customization

### Adding New Production Steps
1. Update the `ProductionData` interface in `productionService.ts`
2. Add new API endpoint methods
3. Update the dashboard UI to display new steps
4. Modify status calculations and metrics

### Modifying Metrics
1. Update calculation functions in the dashboard component
2. Add new metric cards as needed
3. Customize color schemes and icons
4. Implement additional analytics features

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Heroicons
- Fetch API for HTTP requests

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- Efficient data fetching with error handling
- Optimized re-renders using React hooks
- Responsive design for mobile devices
- Minimal bundle size with tree-shaking

## Future Enhancements

- Real-time WebSocket connections
- Advanced chart visualizations
- Export functionality for reports
- Mobile app version
- Push notifications for critical updates 