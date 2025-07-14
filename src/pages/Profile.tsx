import { useState } from 'react';
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon, KeyIcon, BellIcon, ShieldIcon, SaveIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import DarkModeToggle from '../components/UI/DarkModeToggle';

const Profile = ({
  userRole
}: {
  userRole: string
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    fullName: 'W.A. Saman Kumara Perera',
    email: 'saman.perera@example.com',
    phone: '+94 77 123 4567',
    address: 'No. 123, Galle Road, Bambalapitiya, Colombo 04',
    company: 'ABC Construction (Pvt) Ltd',
    role: userRole
  });
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    deliveryAlerts: true,
    promotions: false,
    newsletter: true
  });

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

        {/* Profile Navigation */}
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
                  className={`flex items-center space-x-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
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
            <div className="flex justify-end">
              <button className="flex items-center px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90">
                <SaveIcon size={20} className="mr-2" />
                Save Changes
              </button>
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
            <div className="flex justify-end">
              <button className="flex items-center px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90">
                <SaveIcon size={20} className="mr-2" />
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
        </motion.div>
      </div>
    </div>
  );
};
export default Profile;
