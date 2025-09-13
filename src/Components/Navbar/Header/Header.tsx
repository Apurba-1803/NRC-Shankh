import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tab from '../../Tab/Tab';
import TabList from '../../Tab/TabList';
import { TabProvider } from '../../../context/TabContext';
import CreateNewId from '../../UserProfile/Options/CreateNewId';
// import Notifications from '../../UserProfile/Options/Notifications';
import { UserDetailsPage } from '../../UserProfile/UserManagement';
import logo from '../../../assets/Login/logo1.png';
import userIcon from '../../../assets/Icons/user.svg';
import UserSidebar from '../../UserProfile/UserSidebar';
import ManageComponent from '../../UserProfile/Options/ManageAccess/ManageComponent';

interface HeaderProps {
  tabValue: string;
  setTabValue: (value: string) => void;
  onLogout: () => void;
  role: string;
}

const sidebarConfig: {
  [key: string]: { displayName: string; options: { label: string; tab: string }[] }
} = {
  admin: {
    displayName: "Admin",
    options: [
      { label: "Dashboard", tab: "dashboard" },
      { label: "Planner", tab: "planner" },
      // { label: "Notifications", tab: "notifications" },
      { label: "Dispatch Executive", tab: "dispatch" },
      { label: "Edit Working Details", tab: "edit-working-details" },
      // ...other admin options
    ]
  },
  printing_manager: {
    displayName: "Printing Manager",
    options: [
      { label: "Dashboard", tab: "dashboard" },
      { label: "Jobs", tab: "jobs" },
      // { label: "Notifications", tab: "notifications" }
    ]
  },
  production_head: {
    displayName: "Production Head",
    options: [
      { label: "Dashboard", tab: "dashboard" },
      { label: "Jobs", tab: "jobs" },
      // { label: "Notifications", tab: "notifications" }
    ]
  },
  dispatch_executive: {
    displayName: "Dispatch Executive",
    options: [
      { label: "Dashboard", tab: "dashboard" },
      { label: "Jobs", tab: "jobs" },
      // { label: "Notifications", tab: "notifications" }
    ]
  },
  planner: {
    displayName: "Planner",
    options: [
      { label: "Dashboard", tab: "dashboard" },
      { label: "Start New Job", tab: "start new job" },
      // { label: "Notifications", tab: "notifications" },
      { label: "Jobs", tab: "jobs" },
      { label: "Job Assigned", tab: "job assigned" } // ADDED: New tab for Planner
    ]
  },
  // ...other roles
};

const allTabSets: { [key: string]: { label: string; value: string }[] } = {
  admin: [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Planning Department', value: 'planner' },
    { label: 'Printing Department', value: 'printing' },
    { label: 'Production Units', value: 'production' },
     { label: 'Quality Management', value: 'qc' },
    { label: 'Dispatch Details', value: 'dispatch' },
   
    
    // { label: 'Edit Working Details', value: 'edit-working-details' },
    // { label: 'Notifications', value: 'notifications' },
    // ...add any others you had
  ],
  printing_manager: [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Jobs', value: 'jobs' },
    // { label: 'Notifications', value: 'notifications' },
  ],
  production_head: [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Jobs', value: 'jobs' },
    // { label: 'Notifications', value: 'notifications' },
  ],
  dispatch_executive: [
    { label: 'Dashboard', value: 'jobs' },
    { label: 'Jobs', value: 'jobs' },
    // { label: 'Notifications', value: 'notifications' },
  ],
  planner: [
    { label: 'Dashboard', value: 'dashboard' },
    // { label: 'Start New Job', value: 'start new job' },
    { label: 'Create New Job', value: 'create new job' },
    // { label: 'Notifications', value: 'notifications' },
    { label: 'Job Cards', value: 'jobs' },
    { label: 'Job Assigned', value: 'job assigned' }, // ADDED: New tab for Planner
  ],
  // ...other roles
};

const Header: React.FC<HeaderProps> = ({ tabValue, setTabValue, onLogout, role }) => {
  const navigate = useNavigate();
  // Pick the right tab set for the role, default to admin if not found
  const normalizedRole = (role || '').toLowerCase().replace(/ /g, '_');
  const tabItems = allTabSets[normalizedRole] || allTabSets['admin'];

  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateId, setShowCreateId] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [activeManageRole, setActiveManageRole] = useState<string | null>(null);

  // 🔥 NEW: Enhanced tab change handler using Approach 1
 const handleTabChange = (val: string) => {
  const currentPath = window.location.pathname;
  const isOnNestedRoute = currentPath !== '/dashboard' && currentPath.startsWith('/dashboard/');
  
  console.log('Tab change requested:', val);
  console.log('Current path:', currentPath);
  console.log('Is nested route:', isOnNestedRoute);
  
  if (isOnNestedRoute) {
    // If on nested route, navigate back to dashboard first
    console.log('Navigating back to dashboard...');
    navigate('/dashboard');
    
    // Use a longer timeout to ensure navigation completes
    setTimeout(() => {
      console.log('Setting tab value to:', val);
      setTabValue(val);
    }, 100); // Increased timeout for more reliable navigation
  } else {
    // Normal tab switching within dashboard
    console.log('Setting tab directly:', val);
    setTabValue(val);
    
    // Always ensure we're on dashboard route for tab-based navigation
    if (currentPath !== '/dashboard') {
      navigate("/dashboard");
    }
  }
};

const handleLogoClick = () => {
  // Check if we're on a nested route
  const isNestedRoute = location.pathname !== '/dashboard';
  
  // Navigate to dashboard based on role
  if (role === 'admin') {
    setTabValue('dashboard'); // This will show AdminDashboard
    // If we're on a nested route, navigate back to the main dashboard
    if (isNestedRoute) {
      navigate('/dashboard');
    }
  } else if (role === 'planner') {
    setTabValue('dashboard'); // This will show PlannerDashboardContainer  
    // If we're on a nested route, navigate back to the main dashboard
    if (isNestedRoute) {
      navigate('/dashboard');
    }
  }
};

  return (
    <header className="sticky top-0 z-50 bg-[#fafafa] w-full shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-8 py-2">
        {/* Logo */}
        <button 
    onClick={handleLogoClick}
    className="hover:opacity-80 transition-opacity focus:outline-none"
    aria-label="Go to dashboard"
  >
    <img src={logo} alt="Logo" className="h-15 w-auto cursor-pointer" />
  </button>
        {/* Desktop Tabs */}
        <TabProvider value={tabValue}>
  <div className="hidden sm:flex flex-1 justify-center">
    <TabList 
      value={tabValue} 
      onChange={handleTabChange} // 🔥 Change this from setTabValue to handleTabChange
    >
      {tabItems.map((tab: { label: string; value: string }) => (
        <Tab
          key={tab.value}
          label={tab.label}
          value={tab.value}
          selected={tabValue === tab.value}
        />
      ))}
    </TabList>
  </div>
</TabProvider>


        {/* Desktop User Icon */}
        <div className="hidden sm:flex items-center">
          <button
            className="rounded-full bg-gray-200 p-2 hover:cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            <img src={userIcon} alt="User" className="h-5 w-5" />
          </button>
        </div>

        {/* Hamburger for mobile */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded focus:outline-none"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-[#fafafa] border-t border-gray-200 shadow-md animate-fade-in-down flex flex-col items-center py-4 gap-2">
          <TabProvider value={tabValue}>
            <TabList
              value={tabValue}
              onChange={value => { 
                handleTabChange(value); // 🔥 Use the new handler
                setMenuOpen(false); 
              }}
              direction="vertical"
            >
              {tabItems.map((tab: { label: string; value: string }) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} onChange={handleTabChange} />
              ))}
            </TabList>
          </TabProvider>
          <div className="flex justify-center items-center ">
            <span
              className="text-base font-medium text-gray-700 hover:cursor-pointer px-4 py-2 rounded hover:bg-gray-100 transition"
              onClick={() => {
                setSidebarOpen(true);
                setMenuOpen(false);
              }}
            >
              Profile
            </span>
          </div>
        </div>
      )}

      {/* User Sidebar */}
      <UserSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={role}
        onLogout={onLogout}
        onOptionSelect={(option) => {
          if (normalizedRole === 'admin') {
            switch (option) {
              case "Dashboard":
                handleTabChange("dashboard"); // 🔥 Use new handler
                break;
              case "Planner":
                handleTabChange("planner"); // 🔥 Use new handler
                break;
              case "Production Head":
                handleTabChange("production"); // 🔥 Use new handler
                break;
              case "Dispatch Head":
              case "Dispatch Executive":
                handleTabChange("dispatch"); // 🔥 Use new handler
                break;
              case "QC Manager":
                handleTabChange("qc"); // 🔥 Use new handler
                break;
              case "Printing":
              case "Printing Manager":
                handleTabChange("printing"); // 🔥 Use new handler
                break;
              case "Create new ID":
                setShowCreateId(true);
                break;
              case "User Details":
                setShowUserDetails(true);
                break;
              case "Edit Machine":
                navigate('/dashboard/edit-machine');
                break;
              case "Test Edit Machine":
                navigate('/dashboard/test-edit-machine');
                break;
              case "Edit Working Details":
                handleTabChange("edit-working-details"); // 🔥 Use new handler
                break;
            }
            setSidebarOpen(false);
            setMenuOpen(false);
          } else if (normalizedRole === 'printing_manager' || normalizedRole === 'production_head' || normalizedRole === 'dispatch_executive') {
            const found = sidebarConfig[normalizedRole].options.find(o => o.label === option);
            if (found) handleTabChange(found.tab); // 🔥 Use new handler
            setSidebarOpen(false);
            setMenuOpen(false);
          } else if (normalizedRole === 'planner') {
            if (option === "Edit Machine") {
              navigate('/dashboard/edit-machine');
            } else if (option === "Create New Job") {
              handleTabChange("create new job"); // 🔥 Use new handler
            } else if (option === "Start New Job") {
              handleTabChange("start new job"); // 🔥 Use new handler
            } else if (option === "Jobs") {
              handleTabChange("jobs"); // 🔥 Use new handler
            } else if (option === "Job Assigned") {
              handleTabChange("job assigned"); // 🔥 Use new handler
            } else if (option === "Dashboard") {
              handleTabChange("dashboard"); // 🔥 Use new handler
            }
            setSidebarOpen(false);
            setMenuOpen(false);
          }
        }}
        onManageAccessRoleSelect={(role) => {
          setActiveManageRole(role);
          setSidebarOpen(false);
          setMenuOpen(false);
        }}
      />

      {/* Rest of your existing modals/components remain the same */}
      {showCreateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent bg-opacity-40">
          <div className="relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowCreateId(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <CreateNewId onClose={() => setShowCreateId(false)} />
          </div>
        </div>
      )}

      {activeManageRole && (
        <ManageComponent
          role={activeManageRole}
          onClose={() => setActiveManageRole(null)}
        />
      )}

      {showUserDetails && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <UserDetailsPage
            onClose={() => setShowUserDetails(false)}
          />
        </div>
      )}
    </header>
  );
};


export default Header;
