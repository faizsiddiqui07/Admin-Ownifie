// Header.jsx
import React, { useContext, useState } from "react";
import { HiMenu, HiSearch, HiBell, HiCog } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import storeContext from "../../context/storeContext";

const Header = ({ toggleSidebar }) => {
  const { store } = useContext(storeContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="w-full h-16 flex justify-between items-center bg-white px-4 lg:px-6 py-2 shadow-sm border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden text-2xl text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <HiMenu />
        </button>
        
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="text-right text-sm hidden sm:block">
              <div className="font-medium text-gray-800">{store.userInfo?.name}</div>
              <div className="text-xs text-gray-500 capitalize">{store.userInfo?.role}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
              <FaUserCircle className="text-indigo-600 text-xl" />
            </div>
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{store.userInfo?.name}</p>
                <p className="text-xs text-gray-500">{store.userInfo?.email}</p>
              </div>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
              <div className="border-t border-gray-100">
                <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;