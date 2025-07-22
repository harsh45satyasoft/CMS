import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cmsPageAPI } from '../../services/api';

const PublicHome = () => {
  const [recentPages, setRecentPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPages = async () => {
      try {
        const response = await cmsPageAPI.getAll({ 
          limit: 6, 
          enabled: 'true' 
        });
        setRecentPages(response.data || []);
      } catch (error) {
        console.error('Error fetching recent pages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPages();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
        <h1 className="text-5xl font-bold mb-6">Welcome to Your Website</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          This is your CMS-powered website. All content is managed through your admin panel.
        </p>
        <div className="space-x-4">
          <Link
            to="/admin"
            className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            Go to Admin Panel
          </Link>
          {recentPages.length > 0 && (
            <Link
              to={`/page/${recentPages[0].slug || recentPages[0]._id}`}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Explore Pages
            </Link>
          )}
        </div>
      </section>

      {/* Recent Pages Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Recent Pages</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg text-gray-600">Loading pages...</div>
          </div>
        ) : recentPages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPages.map((page) => (
              <div key={page._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3">{page.pageTitle}</h3>
                  
                  {page.metaDescription && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {page.metaDescription}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {page.menuType?.name && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {page.menuType.name}
                        </span>
                      )}
                    </div>
                    
                    <Link
                      to={`/page/${page.slug || page._id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      {page.hasFile ? 'View File' : 'Read More'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Pages Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first page in the admin panel to see it here.
            </p>
            <Link
              to="/admin/cms/pages/add"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Your First Page
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8">CMS Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-lg font-semibold mb-2">Content Management</h3>
            <p className="text-sm text-gray-600">Create and manage pages with ease</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-3">📁</div>
            <h3 className="text-lg font-semibold mb-2">File Management</h3>
            <p className="text-sm text-gray-600">Upload and serve files directly</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="text-lg font-semibold mb-2">Menu Organization</h3>
            <p className="text-sm text-gray-600">Organize pages into menus</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
            <p className="text-sm text-gray-600">Changes appear immediately</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicHome;