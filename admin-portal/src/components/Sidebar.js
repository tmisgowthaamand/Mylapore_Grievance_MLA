"use client";
import { LayoutDashboard, Inbox, CheckSquare, Settings, LogOut } from "lucide-react";

export default function Sidebar({ activeTab, onTabChange, onLogout }) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", filter: "Dashboard" },
    { icon: Inbox, label: "Inbox", filter: "Inbox" },
    { icon: CheckSquare, label: "Resolved", filter: "Resolved" },
    { icon: Settings, label: "Settings", filter: "Settings" },
  ];

  return (
    <div className="w-64 h-screen glass border-r border-gray-200/50 flex flex-col p-6 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-slate-800 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-navy/20">
          TVK
        </div>
        <div>
          <h1 className="font-bold text-navy text-sm leading-tight">Admin Portal</h1>
          <p className="text-[10px] text-gray-500 tracking-wider uppercase font-semibold">Mylapore Constituency</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => {
          const isActive = activeTab === item.filter;
          return (
            <button
              key={index}
              onClick={() => onTabChange(item.filter)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                isActive
                  ? "bg-navy text-white shadow-md shadow-navy/20 scale-105"
                  : "text-gray-500 hover:bg-gray-100 hover:text-navy hover:scale-105"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-saffron" : ""}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold text-sm mt-auto group">
        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Logout
      </button>
    </div>
  );
}
