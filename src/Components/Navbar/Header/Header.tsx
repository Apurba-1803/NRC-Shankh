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
    { label: 'Planner', value: 'planner' },
    { label: 'Production Head', value: 'production' },
    { label: 'Dispatch Head', value: 'dispatch' },
    { label: 'QC Manager', value: 'qc' },
    { label: 'Printing', value: 'printing' },
    { label: 'Edit Working Details', value: 'edit-working-details' },
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
    { label: 'Start New Job', value: 'start new job' },
    { label: 'Create New Job', value: 'create new job' },
    // { label: 'Notifications', value: 'notifications' },
    { label: 'Jobs', value: 'jobs' },
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
  // const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [activeManageRole, setActiveManageRole] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-[#fafafa] w-full shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-8 py-2">
        {/* Logo */}
        <img src={logo} alt="Logo" className="h-15 w-auto" />

        {/* Desktop Tabs */}
        <TabProvider value={tabValue}>
          <div className="hidden sm:flex flex-1 justify-center">
            <TabList value={tabValue} onChange={setTabValue}>
  {tabItems.map((tab: { label: string; value: string }) => (
    <Tab
      key={tab.value}
      label={tab.label}
      value={tab.value}
      selected={tabValue === tab.value} // highlight active tab
      onChange={(val) => {
        setTabValue(val);

        // 👇 sync tab with route
        switch (val) {
          case "dashboard":
            navigate("/dashboard");
            break;
          case "jobs":
            navigate("/dashboard/jobs");
            break;
          case "job-assigned":
            navigate("/dashboard/job-assigned");
            break;
          case "start-job":
            navigate("/dashboard/start-job");
            break;
          case "dispatch":
            navigate("/dashboard/dispatch");
            break;
          case "production":
            navigate("/dashboard/production");
            break;
          default:
            navigate(`/dashboard/${val}`);
        }
      }}
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
              onChange={value => { setTabValue(value); setMenuOpen(false); }}
              direction="vertical"
            >
              {tabItems.map((tab: { label: string; value: string }) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} onChange={setTabValue} />
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
                setTabValue("dashboard");
                break;
              case "Planner":
                setTabValue("planner");
                break;
              case "Production Head":
                setTabValue("production");
                break;
              case "Dispatch Head":
              case "Dispatch Executive":
                setTabValue("dispatch");
                break;
              case "QC Manager":
                setTabValue("qc");
                break;
              case "Printing":
              case "Printing Manager":
                setTabValue("printing");
                break;
              // case "Notifications":
              //   setShowNotifications(true);
              //   break;
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
                setTabValue("edit-working-details");
                break;
            }
            setSidebarOpen(false);
            setMenuOpen(false);
          } else if (normalizedRole === 'printing_manager' || normalizedRole === 'production_head' || normalizedRole === 'dispatch_executive') {
            const found = sidebarConfig[normalizedRole].options.find(o => o.label === option);
            if (found) setTabValue(found.tab);
            setSidebarOpen(false);
            setMenuOpen(false);
          } else if (normalizedRole === 'planner') {
            if (option === "Edit Machine") {
              navigate('/dashboard/edit-machine');
            } else if (option === "Create New Job") {
              setTabValue("create new job");
            } else if (option === "Start New Job") {
              setTabValue("start new job");
            } else if (option === "Jobs") {
              setTabValue("jobs");
            } else if (option === "Job Assigned") {
              setTabValue("job assigned");
            } else if (option === "Dashboard") {
              setTabValue("dashboard");
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

      {/* {showNotifications && (
        <Notifications onClose={() => setShowNotifications(false)} />
      )} */}

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
