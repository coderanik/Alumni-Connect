import React from "react";
import { useNavigate } from "react-router-dom";
import {
  House,
  MessageSquareMore,
  Globe,
  Users,
  SquareChevronRight,
  Settings,
  LogOut,
  MessageCircle
} from "lucide-react";
import { assets } from '../assets/assets';
import { handleSuccess } from "../utils/utils";

const Sidebar = ({ setActiveSection, activeSection }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    handleSuccess("Logged Out Successfully");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const menuItems = [
    { name: "dashboard", icon: <House size={20} />, label: "Dashboard" },
    { name: "messages", icon: <MessageSquareMore size={20} />, label: "Messages" },
    { name: "events", icon: <Globe size={20} />, label: "Events" },
    { name: "network", icon: <Users size={20} />, label: "Network" },
    { name: "open-source", icon: <SquareChevronRight size={20} />, label: "Open Source" },
    { name: "forum", icon: <MessageCircle size={20} />, label: "Forum" }
  ];

  // Route mapping
  const routes = {
    dashboard: "/dashboard",
    messages: "/messages", // Placeholder for future route
    events: "/events",     // Placeholder for future route
    network: "/network",
    "open-source": "/open-source", // Placeholder
    forum: "/forum" // Placeholder for future route
  };

  return (
    <div className="fixed top-0 left-0 w-56 min-h-screen bg-white border-r font-outfit shadow-sm flex flex-col">
      <div className="flex justify-center py-5">
        <img
          src={assets.Logo}
          alt="Logo"
          className="h-16 w-auto cursor-pointer"
          onClick={() => navigate('/')}
        />
      </div>

      <ul className="text-[#2B64BB] mt-5 flex-1">
        {menuItems.map(item => (
          <li
            key={item.name}
            className={`flex items-center gap-3 py-3 px-4 cursor-pointer transition-all hover:bg-[#F2F3FF] ${
              activeSection === item.name ? "bg-[#F2F3FF] border-r-4 border-primary font-medium" : ""
            }`}
            onClick={() => {
              setActiveSection(item.name);
              if (routes[item.name]) {
                navigate(routes[item.name]);
              }
            }}
          >
            {item.icon}
            <p>{item.label}</p>
          </li>
        ))}
      </ul>

      <div className="mt-auto mb-6">
        <div
          className={`flex items-center gap-3 py-3 px-4 cursor-pointer transition-all hover:bg-[#F2F3FF] ${
            activeSection === "settings" ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`}
          onClick={() => setActiveSection("settings")}
        >
          <Settings size={20} />
          <p>Settings</p>
        </div>

        <button
          className="flex items-center gap-3 py-3 px-4 w-full text-left text-red-500 cursor-pointer transition-all hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <p>Logout</p>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
