import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { cmsPageAPI } from '../../services/api';

const PublicPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get page by slug
        const allPages = await cmsPageAPI.getAll({ search: slug });
        let foundPage = allPages.data.find(p => p.slug === slug && p.isEnabled);
        
        // If not found by slug, try by ID (for backward compatibility)
        if (!foundPage) {
          try {
            const pageById = await cmsPageAPI.getById(slug);
            if (pageById.isEnabled) {
              foundPage = pageById;
            }
          } catch (err) {
            // Page not found by ID either
          }
        }

        if (foundPage) {
          setPage(foundPage);
          
          // Update document title and meta tags
          document.title = foundPage.windowTitle || foundPage.pageTitle || 'Page';
          
          // Update meta description
          if (foundPage.metaDescription) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
              metaDesc = document.createElement('meta');
              metaDesc.name = 'description';
              document.head.appendChild(metaDesc);
            }
            metaDesc.content = foundPage.metaDescription;
          }

          // Update meta keywords
          if (foundPage.metaKeywords) {
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
              metaKeywords = document.createElement('meta');
              metaKeywords.name = 'keywords';
              document.head.appendChild(metaKeywords);
            }
            metaKeywords.content = foundPage.metaKeywords;
          }
        } else {
          setError('Page not found');
        }
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('Error loading page');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-xl">Loading page...</div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
          Go Home
        </a>
      </div>
    );
  }

  // Handle external URL
  if (page.hasExtURL && page.url) {
    if (page.openInNewWindow) {
      window.open(page.url, '_blank');
      return (
        <div className="text-center py-16">
          <p className="text-gray-600">Opening external link in new window...</p>
          <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">Return to Home</a>
        </div>
      );
    } else {
      window.location.href = page.url;
      return null;
    }
  }

  // Handle file download
  if (page.hasFile && page.fileName) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{page.pageTitle}</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">File Available for Download</h2>
            <p className="text-gray-600 mb-4">
              File: {page.originalFileName || page.fileName}
              {page.fileSize && (
                <span className="ml-2 text-sm text-gray-500">
                  ({(page.fileSize / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </p>
            
            <div className="space-x-4">
              <a
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cms-pages/file/${page._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                View File
              </a>
              <a
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cms-pages/file/${page._id}`}
                download
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                Download File
              </a>
            </div>
          </div>

          {page.metaDescription && (
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{page.metaDescription}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular content page
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">{page.pageTitle}</h1>
        
        {page.metaDescription && (
          <div className="text-lg text-gray-600 mb-8 leading-relaxed">
            {page.metaDescription}
          </div>
        )}

        {/* Placeholder for content - you can expand this */}
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-4">
            This is a placeholder content area for the page "{page.pageTitle}". 
            You can extend your CMS to include rich content fields like:
          </p>
          
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>Rich text editor content</li>
            <li>Image galleries</li>
            <li>Video embeds</li>
            <li>Custom HTML content</li>
            <li>Block-based content sections</li>
          </ul>

          {page.url && !page.hasExtURL && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Internal URL:</strong> {page.url}
              </p>
            </div>
          )}
        </div>

        {/* Page metadata (for debugging - remove in production) */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <details className="text-sm text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">Page Information</summary>
            <div className="mt-2 space-y-1">
              <p><strong>Slug:</strong> {page.slug}</p>
              <p><strong>Menu Type:</strong> {page.menuType?.name}</p>
              <p><strong>Parent:</strong> {page.parentId?.pageTitle || 'None'}</p>
              <p><strong>Order:</strong> {page.orderId}</p>
              {page.metaKeywords && <p><strong>Keywords:</strong> {page.metaKeywords}</p>}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default PublicPage;