import React from 'react';
import { User, X, Edit3, Trash2 } from 'lucide-react';
import { type UserData, getRoleDisplayName, formatDate } from './types';

interface UserDetailsModalProps {
  user: UserData;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose, onEdit, onDelete }) => {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="w-full px-8 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              </div>
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
          <div className="space-y-4">
            {/* ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
              <p className="text-gray-900 font-semibold">{user.id}</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <p className="text-gray-900">{user.name}</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>



            {/* Roles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {getRoleDisplayName(role)}
                  </span>
                ))}
              </div>
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {user.active ? 'Yes' : 'No'}
              </span>
            </div>

            {/* Last Login */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
              <p className="text-gray-900">{formatDate(user.lastLogin)}</p>
            </div>

            {/* Created Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
              <p className="text-gray-900">{formatDate(user.createdAt)}</p>
            </div>

            {/* Updated Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Updated</label>
              <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="w-full px-8 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit3 size={16} />
            <span>Edit User</span>
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>Delete User</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal; 