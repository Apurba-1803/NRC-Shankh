import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { roleOptions, type CreateUserPayload } from "../UserManagement/types";

interface CreateNewIdProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateNewId: React.FC<CreateNewIdProps> = ({ onClose, onSuccess }) => {
  console.log('Available role options:', roleOptions);
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleToggle = (roleValue: string) => {
    console.log('Role toggle clicked:', roleValue);
    setSelectedRoles(prev => {
      const newRoles = prev.includes(roleValue)
        ? prev.filter(role => role !== roleValue)
        : [...prev, roleValue];
      console.log('Updated selected roles:', newRoles);
      return newRoles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRoles.length === 0) {
      setError("Please select at least one role");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Form data:', form);
      console.log('Selected roles before payload:', selectedRoles);
      
      const payload: CreateUserPayload = {
        email: form.email,
        password: form.password,
        roles: selectedRoles,
        firstName: form.firstName,
        lastName: form.lastName,
      };
      
      console.log('Final payload being sent to backend:', payload);
      console.log('Payload JSON stringified:', JSON.stringify(payload));

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      const response = await fetch('https://nrprod.nrcontainers.com/api/auth/add-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('User created successfully!');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to create user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="w-full px-8 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-[#00AEEF] text-sm mt-1">Create New Login ID</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full px-8 py-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                required
              />
            </div>



            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Set Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Roles (Multiple)</label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleToggle(role.value)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedRoles.includes(role.value)
                        ? 'bg-[#00AEEF] text-white shadow-lg'
                        : 'bg-purple-100 text-gray-700 hover:bg-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{role.label}</span>
                      {selectedRoles.includes(role.value) && (
                        <Check size={16} className="text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Selected Roles Display */}
              {selectedRoles.length > 0 && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <strong>Selected:</strong> {selectedRoles.join(', ')}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || selectedRoles.length === 0}
              className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              )}
              {loading ? 'Creating...' : 'Create ID'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNewId;
