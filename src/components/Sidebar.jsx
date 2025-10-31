// import { Home, Settings, LayoutGrid } from 'lucide-react';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from 'lucide-react';
import { PowerIcon } from '@heroicons/react/20/solid';

const Sidebar = ({ isSidebarOpen, setSidebarOpen, quitAppFunction}) => {  
  // catatan isSidebarOpen adalah nilai yang diterima dari parent untuk ditampilkan di fungsi ini
  // setSidebarOpen adalh nilai yang digunakan untuk mengubah variabel yang ada diparent
  const navigate = useNavigate();   // fungsi untuk mengarahkan ke link (ada di index.jsx ---> route)
  const menu = [
    { icon: <LayoutGrid size={20} />, label: 'Setting Ruangan', link: '/settingRuangan'},
    { icon: <LayoutGrid size={20} />, label: 'Setting Lokasi Rak', link: '/settingLokasiRak'},
  ];

  const { ipcRenderer } = window.require("electron");

  // Fungsi Quit App
  const quitApp = () => {
    quitAppFunction === undefined ? navigate('/') : quitAppFunction();
  }

  return (
    <div
      className={`transition-all duration-300 bg-gray-800 text-white h-screen ${
        isSidebarOpen ? "w-44" : "w-12"
      } flex flex-col items-center py-4 relative sidebar`}
      >
      {/* Toggle Button (selalu terlihat) */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 -right-3.5 bg-gray-800 text-white border border-gray-600 rounded-full w-7 h-7 text-xs"
        >
        {isSidebarOpen ? "<" : ">"}
      </button>

      {/* Judul Sidebar */}
      {isSidebarOpen && (
        <div className="p-6 text-xl font-bold border-b border-gray-700" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          <h2>IGR Layout Designer</h2>
        </div>
      )}
      {/* Sidebar Content */}
      {isSidebarOpen && (
        <ul className="mt-10 space-y-4 w-full text-left px-4">
          <li 
            className=" group flex items-center pb-1 gap-3 hover:text-gray-500 cursor-pointer transition-colors border-b-2 border-gray-500 border-solid"
            onClick={() => navigate('/settingRuangan')}
            >
            <LayoutGrid size={20} />
            <span>
              Setting Ruangan
            </span>
          </li>
          <li 
            className=" group flex items-center pb-1 gap-3 hover:text-gray-500 cursor-pointer transition-colors border-b-2 border-gray-500 border-solid"
            onClick={() => navigate('/settingLokasiRak')}
            >
            <LayoutGrid size={20} />
            <span>
              Setting Lokasi Rak
            </span>
          </li>
        </ul>
      )}
      {/* Quit Button */}
      {isSidebarOpen && (
        <div className="p-6 w-full font-bold absolute bottom-0">
          <button 
            className="group px-5 py-2 gap-2 flex items-center rounded-lg top-2 right-2 hover:text-gray-500"
            onClick={quitApp}
          >
            <PowerIcon
              className="w-6 h-6 mr-4 text-white group-hover:text-gray-500"
              aria-hidden="true"
            />
            Quit
          </button>
        </div>
      )}
    </div>
  )
}

export default Sidebar;