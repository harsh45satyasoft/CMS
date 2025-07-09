import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Plus,
  Menu,
  Link as LinkIcon,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      disabled: true, // Make it active
    },
    {
      title: "Manage Pages",
      icon: FileText,
      path: "/cms/pages",
      children: [
        {
          title: "All Pages",
          icon: FileText,
          path: "/cms/pages",
        },
        {
          title: "Add Page",
          icon: Plus,
          path: "/cms/pages/add",
        },
      ],
    },
    {
      title: "Menu Types",
      icon: Menu,
      path: "/menu-types",
      disabled: false,
    },
    {
      title: "Footer Links",
      icon: LinkIcon,
      path: "/footer-links",
      disabled: true,
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
      disabled: true,
    },
  ];

  const isActive = (path) => {
    if (path === "/cms/pages") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">CMS Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.children ? (
                <div>
                  <div className="flex items-center px-4 py-2 text-gray-300 font-medium">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.title}
                  </div>
                  <ul className="ml-4 space-y-1">
                    {item.children.map((child, childIndex) => (
                      <li key={childIndex}>
                        <Link
                          to={child.path}
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            isActive(child.path)
                              ? "bg-blue-600 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white"
                          }`}
                        >
                          <child.icon className="w-4 h-4 mr-3" />
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link
                  to={item.disabled ? "#" : item.path}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    item.disabled
                      ? "text-gray-500 cursor-not-allowed"
                      : isActive(item.path)
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                  onClick={
                    item.disabled ? (e) => e.preventDefault() : undefined
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;