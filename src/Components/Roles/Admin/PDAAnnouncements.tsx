import React, { useState } from "react";
import { Bell, X, Send } from "lucide-react";

interface Announcement {
  id: number;
  subject: string;
  content: string;
  createdAt: string;
}

const PDAAnnouncements: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !content.trim()) {
      alert("Please fill in both subject and content");
      return;
    }

    // Create new announcement
    const newAnnouncement: Announcement = {
      id: Date.now(),
      subject: subject.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    // Add to announcements list
    setAnnouncements([newAnnouncement, ...announcements]);

    // Reset form
    setSubject("");
    setContent("");
    setShowForm(false);

    alert("Announcement created successfully!");
  };

  const handleCancel = () => {
    setShowForm(false);
    setSubject("");
    setContent("");
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setAnnouncements(announcements.filter((ann) => ann.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Bell className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">
            PDA Announcements
          </h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Bell size={18} />
          <span>{showForm ? "Cancel" : "New Announcement"}</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4">
            Create New Announcement
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter announcement subject..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Content Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter announcement content..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Send size={18} />
                <span>Publish Announcement</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No announcements yet</p>
            <p className="text-sm">
              Create your first announcement to get started
            </p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {announcement.subject}
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="ml-4 text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Delete announcement"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {new Date(announcement.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PDAAnnouncements;
