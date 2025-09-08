export interface UserData {
  id: string;
  name: string;
  email: string;
  roles: string[];
  active: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  roles: string[];
  firstName: string;
  lastName: string;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  roles: string[];
  password?: string;
}

// Role options matching the backend expectations
export const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Planner", value: "planner" },
  { label: "Production Head", value: "production_head" },
  { label: "Dispatch Executive", value: "dispatch_executive" },
  { label: "QC Manager", value: "qc_manager" },
  { label: "Printer", value: "printer" },
  { label: "Corrugator", value: "corrugator" },
  { label: "Flute Laminator", value: "flutelaminator" },
  { label: "Pasting Operator", value: "pasting_operator" },
  { label: "Punching Operator", value: "punching_operator" },
  { label: "Paper Store", value: "paperstore" },
];

export const getRoleDisplayName = (roleValue: string): string => {
  const roleMap: Record<string, string> = {
    'admin': 'Admin',
    'planner': 'Planner',
    'production_head': 'Production Head',
    'dispatch_executive': 'Dispatch Executive',
    'qc_manager': 'QC Manager',
    'printer': 'Printer',
    'corrugator': 'Corrugator',
    'flutelaminator': 'Flute Laminator',
    'pasting_operator': 'Pasting Operator',
    'punching_operator': 'Punching Operator',
    'paperstore': 'Paper Store'
  };
  return roleMap[roleValue] || roleValue;
};

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid Date';
  }
}; 