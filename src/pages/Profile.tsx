import { useState, useEffect } from 'react';
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon, KeyIcon, BellIcon, ShieldIcon, SaveIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import DarkModeToggle from '../components/UI/DarkModeToggle';
import { useAuth } from '../hooks/useAuth';

const Profile = ({
  userRole
}: {
  userRole: string
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    role: userRole
  });
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    deliveryAlerts: true,
    promotions: false,
    newsletter: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Save profile changes to backend
  const saveProfile = async () => {
    try {
      setIsSaving(true);
      setSaveMessage('');
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setSaveMessage('Authentication required. Please log in again.');
        return;
      }

      // Format address back to object if needed
      const addressObj = profileData.address ? {
        street: profileData.address.split(',')[0]?.trim() || '',
        city: profileData.address.split(',')[1]?.trim() || '',
        state: profileData.address.split(',')[2]?.trim() || '',
        zipCode: profileData.address.split(',')[3]?.trim() || '',
        country: profileData.address.split(',')[4]?.trim() || (
          // Only add 'Sri Lanka' if it's not already in the city field
          profileData.address.includes('Sri Lanka') ? '' : 'Sri Lanka'
        )
      } : undefined;

      const updateData = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        address: addressObj
      };

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (result.success) {
        setSaveMessage('Profile updated successfully!');
        // Refresh the profile data
        await fetchUserProfile();
      } else {
        setSaveMessage(`Error: ${result.error || 'Failed to update profile'}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Error: Failed to save profile changes');
    } finally {
      setIsSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Save notification preferences
  const saveNotifications = async () => {
    try {
      setIsSaving(true);
      setSaveMessage('');
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setSaveMessage('Authentication required. Please log in again.');
        return;
      }

      const preferencesData = {
        preferences: {
          notifications: notifications.orderUpdates,
          emailNotifications: notifications.deliveryAlerts,
          smsNotifications: notifications.promotions
        }
      };

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferencesData)
      });

      const result = await response.json();

      if (result.success) {
        setSaveMessage('Notification preferences updated successfully!');
      } else {
        setSaveMessage(`Error: ${result.error || 'Failed to update preferences'}`);
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
      setSaveMessage('Error: Failed to save notification preferences');
    } finally {
      setIsSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Fetch full user profile data
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const userData = result.data;

          // Format address - handle both string and object formats
          let addressString = '';
          if (userData.address) {
            if (typeof userData.address === 'string') {
              addressString = userData.address;
            } else if (userData.address.street || userData.address.city) {
              const parts = [
                userData.address.street,
                userData.address.city,
                userData.address.state,
                userData.address.zipCode,
                userData.address.country
              ].filter(Boolean);
              addressString = parts.join(', ');

              // Remove duplicate "Sri Lanka" if it appears twice
              addressString = addressString.replace(/,\s*Sri Lanka,\s*Sri Lanka/gi, ', Sri Lanka');
            }
          }

          setProfileData({
            fullName: userData.fullName || userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: addressString,
            company: userData.company || '',
            role: userData.role || userRole
          });

          // Update notifications from user preferences
          if (userData.preferences) {
            setNotifications({
              orderUpdates: userData.preferences.notifications !== false,
              deliveryAlerts: userData.preferences.emailNotifications !== false,
              promotions: userData.preferences.smsNotifications === true,
              newsletter: userData.preferences.notifications !== false
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load real user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [user, userRole]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 xs:p-6 relative">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <DarkModeToggle />
      </div>

      {/* Beautiful background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Profile & Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account and preferences</p>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <span className="text-gray-600 dark:text-gray-400 ml-2">Loading your profile...</span>
            </div>
          </motion.div>
        ) : (
          /* Profile Navigation */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'profile', label: 'Profile Information', icon: <UserIcon size={18} /> },
                  { id: 'security', label: 'Security', icon: <ShieldIcon size={18} /> },
                  { id: 'notifications', label: 'Notifications', icon: <BellIcon size={18} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-200 ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Profile Information */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex flex-col xs:flex-row items-center xs:items-start gap-4">
                    <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-full bg-secondary-600 flex items-center justify-center text-white text-xl xs:text-2xl">
                      {profileData.fullName.charAt(0)}
                    </div>
                    <div className="text-center xs:text-left">
                      <h2 className="text-lg xs:text-xl font-semibold text-gray-800 dark:text-white">
                        {profileData.fullName}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " />                  <input type="text" value={profileData.fullName} onChange={e => setProfileData({
                          ...profileData,
                          fullName: e.target.value
                        })}
                          placeholder="e.g., W.A. Saman Kumara Perera"
                          className="pl-10 block w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <MailIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " />                  <input type="email" value={profileData.email} onChange={e => setProfileData({
                          ...profileData,
                          email: e.target.value
                        })} className="pl-10 block w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <PhoneIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " />
                        <span className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                          +94
                        </span>
                        <input
                          type="tel"
                          value={profileData.phone.startsWith('+94') ? profileData.phone.substring(3) : profileData.phone}
                          onChange={e => {
                            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                            if (value.length <= 9) {
                              setProfileData({
                                ...profileData,
                                phone: '+94' + value
                              });
                            }
                          }}
                          placeholder="77 123 4567"
                          maxLength={9}
                          className="pl-16 pr-4 block w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <div className="relative">
                        <MapPinIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " />
                        <input type="text" value={profileData.address} onChange={e => setProfileData({
                          ...profileData,
                          address: e.target.value
                        })}
                          placeholder="e.g., No. 123, Galle Road, Bambalapitiya, Colombo 04"
                          className="pl-10 block w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <div className="relative">
                        <UserIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " />
                        <input type="text" value={profileData.company} onChange={e => setProfileData({
                          ...profileData,
                          company: e.target.value
                        })}
                          placeholder="e.g., ABC Construction (Pvt) Ltd"
                          className="pl-10 block w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {saveMessage && (
                      <div className={`text-sm px-3 py-2 rounded ${saveMessage.includes('Error')
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                        {saveMessage}
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button
                        onClick={saveProfile}
                        disabled={isSaving}
                        className="flex items-center px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SaveIcon size={20} className="mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="p-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 ">
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <KeyIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " />
                        <input type="password" className="pl-10 block w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <KeyIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " />
                        <input type="password" className="pl-10 block w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <KeyIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " />
                        <input type="password" className="pl-10 block w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="flex items-center px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90">
                      <ShieldIcon size={20} className="mr-2" />
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 ">
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BellIcon size={20} className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 ">
                            Order Updates
                          </p>
                          <p className="text-xs text-gray-500 ">
                            Receive updates about your orders
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifications.orderUpdates} onChange={e => setNotifications({
                          ...notifications,
                          orderUpdates: e.target.checked
                        })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF6B35]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BellIcon size={20} className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 ">
                            Delivery Alerts
                          </p>
                          <p className="text-xs text-gray-500 ">
                            Get notified about delivery status
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifications.deliveryAlerts} onChange={e => setNotifications({
                          ...notifications,
                          deliveryAlerts: e.target.checked
                        })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF6B35]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BellIcon size={20} className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 ">
                            Promotional Emails
                          </p>
                          <p className="text-xs text-gray-500 ">
                            Receive special offers and updates
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifications.promotions} onChange={e => setNotifications({
                          ...notifications,
                          promotions: e.target.checked
                        })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF6B35]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BellIcon size={20} className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 ">
                            Newsletter
                          </p>
                          <p className="text-xs text-gray-500 ">
                            Weekly newsletter with industry updates
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifications.newsletter} onChange={e => setNotifications({
                          ...notifications,
                          newsletter: e.target.checked
                        })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF6B35]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {saveMessage && (
                      <div className={`text-sm px-3 py-2 rounded ${saveMessage.includes('Error')
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                        {saveMessage}
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button
                        onClick={saveNotifications}
                        disabled={isSaving}
                        className="flex items-center px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SaveIcon size={20} className="mr-2" />
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
export default Profile;
