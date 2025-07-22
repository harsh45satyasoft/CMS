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
      disabled: false, // Make it active
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
        {
          title: "Reorder Pages", // ✅ New menu item here
          icon: Menu,
          path: "/cms/pages/reorder",
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

  const isActive = (path) => {                  //Defines a function that takes a path (like "/cms/pages" or "/cms")
    if (path === "/cms/pages") {                //Special condition for the path "/cms/pages", Returns true only if the current URL path exactly equals "/cms/pages", So "/cms/pages/add" or "/cms/pages/edit" would return false here
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);  //For all other paths, it returns true if the current URL path starts with the given path
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
          {menuItems.map(
            (
              item,
              index //You loop through all menu items. Each item could be: A parent item with children (rendered with a <ul> inside), A single link (no children)
            ) => (
              <li key={index}>
                {item.children ? ( //If the item has children, it renders a parent item with a nested list for children
                  <div>
                    <div className="flex items-center px-4 py-2 text-gray-300 font-medium">
                      {" "}
                      {/* parent title with icon */}
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.title}
                    </div>
                    <ul className="ml-4 space-y-1">
                      {item.children.map(
                        (
                          child,
                          childIndex // child links
                        ) => (
                          <li key={childIndex}>
                            <Link                    
                              to={child.path}
                              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                                isActive(child.path)
                                  ? "bg-blue-600 text-white" // active styling
                                  : "text-gray-300 hover:bg-gray-700 hover:text-white" // default/hover
                              }`}
                            >
                              <child.icon className="w-4 h-4 mr-3" />
                              {child.title}
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ) : (
                  <Link                                    //If the item does not have children, it renders a single link( If item.children doesn't exist), item.disabled: disables the link, prevents navigation, Active path check: adds bg-blue-600 text-white if active
                    to={item.disabled ? "#" : item.path}   //If the item is disabled, it renders a disabled link with a "#" href to prevent navigation
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      item.disabled
                        ? "text-gray-500 cursor-not-allowed"
                        : isActive(item.path)                               //If the item is active, it applies the active styling
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
            )
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;