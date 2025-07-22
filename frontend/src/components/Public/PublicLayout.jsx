import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menuTypeAPI, cmsPageAPI } from '../../services/api';

const PublicLayout = ({ children }) => {
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        // Get all menu types
        const menuTypes = await menuTypeAPI.getAll();
        const menuStructure = {};

        // For each menu type, get the pages
        for (const menuType of menuTypes) {
          const pages = await cmsPageAPI.getTreeByMenuType(menuType._id);
          menuStructure[menuType.name] = {
            id: menuType._id,
            pages: pages
          };
        }

        setMenuData(menuStructure);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const renderMenuItem = (page) => (
    <li key={page.id} className="relative group">
      <Link
        to={`/page/${page.slug || page.id}`}
        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
      >
        {page.title}
      </Link>
      {page.children && page.children.length > 0 && (
        <ul className="absolute left-full top-0 min-w-48 bg-white border border-gray-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          {page.children.map(child => renderMenuItem(child))}
        </ul>
      )}
    </li>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                Your Website
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-8">
              {/* Header Menu */}
              {menuData['Header Menu'] && (
                <ul className="flex space-x-6">
                  {menuData['Header Menu'].pages.map(page => (
                    <li key={page.id} className="relative group">
                      <Link
                        to={`/page/${page.slug || page.id}`}
                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      >
                        {page.title}
                      </Link>
                      {page.children && page.children.length > 0 && (
                        <ul className="absolute top-full left-0 min-w-48 bg-white border border-gray-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          {page.children.map(child => renderMenuItem(child))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* Admin Link */}
              <Link
                to="/admin"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Admin Panel
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Footer Menu */}
            {menuData['Footer Menu'] && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  {menuData['Footer Menu'].pages.map(page => (
                    <li key={page.id}>
                      <Link
                        to={`/page/${page.slug || page.id}`}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {page.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <p className="text-gray-300">
                Your Company Name<br />
                123 Street Address<br />
                City, State 12345<br />
                Phone: (555) 123-4567
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Facebook</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Your Company Name. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;