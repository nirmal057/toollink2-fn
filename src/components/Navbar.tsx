import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Popover, Transition } from '@headlessui/react';
import { MenuIcon, UserCircleIcon } from '@heroicons/react/outline';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <Popover className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              ToolLink
            </Link>
          </div>
          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center">
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none">
                <UserCircleIcon className="h-8 w-8" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }: { active: boolean }) => (
                      <Link
                        to="/profile"
                        className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                      >
                        Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }: { active: boolean }) => (
                      <button
                        onClick={logout}
                        className={`w-full text-left block px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                      >
                        Sign Out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Popover.Button className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none">
              <MenuIcon className="h-6 w-6" />
            </Popover.Button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      <Transition
        as={Fragment}
        enter="transition duration-200 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Popover.Panel className="md:hidden bg-white shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export default Navbar;
