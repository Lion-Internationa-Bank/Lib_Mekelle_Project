import { useState } from "react";

type MenuItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
};

const menuItems: MenuItem[] = [
  {
    id: "parcels",
    label: "Land Parcels",
    icon: "📍",
    href: "/parcels",
  },
  {
    id: "ownership",
    label: "Ownership",
    icon: "👥",
    href: "/ownership",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "📊",
    href: "/reports",
  },
];

const Sidebar = () => {
  const [activeMenu, setActiveMenu] = useState("parcels");

  return (
    <aside className="w-64 bg-white/90 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 h-screen sticky top-0 z-40 overflow-y-auto">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg">
            ML
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Mekele Land
            </h2>
            <p className="text-xs text-gray-500 font-medium">Management System</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeMenu === item.id
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
            onClick={() => setActiveMenu(item.id)}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
