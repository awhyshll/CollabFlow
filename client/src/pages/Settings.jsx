import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { doc, updateDoc } from 'firebase/firestore'
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { User, Mail, Lock, Bell, Palette, Save, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

function Settings() {
  const { user, userProfile, fetchUserProfile } = useAuth()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    displayName: userProfile?.displayName || '',
    email: user?.email || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    taskAssignments: true,
    taskComments: true,
    boardInvites: true,
    weeklyDigest: false
  })

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName
      })

      // Update Firestore user document
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profileData.displayName,
        updatedAt: new Date().toISOString()
      })

      await fetchUserProfile(user.uid)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match')
    }

    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }

    setLoading(true)

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      )
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Update password
      await updatePassword(auth.currentUser, passwordData.newPassword)

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      toast.success('Password updated successfully!')
    } catch (error) {
      console.error('Error updating password:', error)
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect')
      } else {
        toast.error('Failed to update password')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async () => {
    setLoading(true)

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        notifications,
        updatedAt: new Date().toISOString()
      })

      toast.success('Notification preferences saved!')
    } catch (error) {
      console.error('Error updating notifications:', error)
      toast.error('Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Settings</h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Manage your account preferences</p>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-200 border-gray-300'}`}>
        {/* Tabs */}
        <div className={`flex border-b ${isDark ? 'border-dark-border' : 'border-slate-200'}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? `text-primary-500 border-b-2 border-primary-500 ${isDark ? 'bg-primary-900/20' : 'bg-primary-50'}`
                  : `${isDark ? 'text-gray-400 hover:text-white hover:bg-dark-border' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {profileData.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <button
                    type="button"
                    className={`absolute bottom-0 right-0 p-2 rounded-full shadow-lg border transition-colors ${isDark ? 'bg-dark-card border-dark-border hover:bg-dark-border' : 'bg-gray-200 border-gray-300 hover:bg-gray-300'}`}
                  >
                    <Camera size={16} className={isDark ? 'text-gray-400' : 'text-slate-600'} />
                  </button>
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{profileData.displayName || 'User'}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{user?.email}</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white' : 'border-slate-200'}`}
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className={`w-full px-4 py-3 border rounded-lg ${isDark ? 'bg-dark-border border-dark-border text-gray-500' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Email cannot be changed</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Change Password</h3>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white' : 'border-slate-200'}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white' : 'border-slate-200'}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark ? 'bg-dark-bg border-dark-border text-white' : 'border-slate-200'}`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Lock size={18} />
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Notification Preferences</h3>
              
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email notifications for important updates' },
                  { key: 'taskAssignments', label: 'Task Assignments', description: 'Get notified when tasks are assigned to you' },
                  { key: 'taskComments', label: 'Task Comments', description: 'Get notified when someone comments on your tasks' },
                  { key: 'boardInvites', label: 'Board Invites', description: 'Get notified when you\'re invited to a board' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Receive a weekly summary of your activity' }
                ].map(item => (
                  <div key={item.key} className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-dark-bg' : 'bg-slate-50'}`}>
                    <div>
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{item.label}</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-100 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${isDark ? 'bg-dark-border after:border-dark-border' : 'bg-gray-300 after:border-gray-400'}`}></div>
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNotificationUpdate}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
