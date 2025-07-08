import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { cmsPageAPI, menuTypeAPI } from "../../services/api";
import { Pencil, Trash, Eye, EyeOff, Plus, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../UI/Button";
import Input from "../UI/Input";
import Modal from "../UI/Modal";

const AllPages = () => {
  const navigate = useNavigate();
  const { state, actions } = useAppContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPages();
    fetchMenuTypes();
  }, [state.filters, state.pagination.current]);

  const fetchPages = async () => {
    try {
      actions.setLoading(true);
      const params = {
        page: state.pagination.current,
        limit: state.pagination.limit,
        search: state.filters.search,
        menuType: state.filters.menuType,
        enabled: state.filters.enabled,
      };

      const response = await cmsPageAPI.getAll(params);
      actions.setPages(response.data);
      actions.setPagination(response.pagination);
    } catch (error) {
      actions.setError(error.message);
      toast.error("Failed to fetch pages");
    }
  };

  const fetchMenuTypes = async () => {
    try {
      const response = await menuTypeAPI.getAll();
      actions.setMenuTypes(response.data);
    } catch (error) {
      console.error("Failed to fetch menu types:", error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    actions.setFilters({ search: value });
    actions.setPagination({ ...state.pagination, current: 1 });
  };

  const handleFilterChange = (key, value) => {
    actions.setFilters({ [key]: value });
    actions.setPagination({ ...state.pagination, current: 1 });
  };

  const clearFilters = () => {
    actions.setFilters({ search: "", menuType: "", enabled: "" });
    actions.setPagination({ ...state.pagination, current: 1 });
  };

  const handleToggleStatus = async (pageId) => {
    try {
      const response = await cmsPageAPI.toggleStatus(pageId);
      actions.updatePage(response.data);
      toast.success(response.message);
    } catch (error) {
      toast.error("Failed to update page status");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await cmsPageAPI.delete(pageToDelete._id);
      actions.deletePage(pageToDelete._id);
      toast.success("Page deleted successfully");
      setShowDeleteModal(false);
      setPageToDelete(null);
    } catch (error) {
      toast.error("Failed to delete page");
    }
  };

  const handlePageChange = (page) => {
    actions.setPagination({ ...state.pagination, current: page });
  };

  const getMenuTypeName = (menuTypeId) => {
    const menuType = state.menuTypes.find((mt) => mt._id === menuTypeId);
    return menuType ? menuType.name : "Unknown";
  };

  const renderPagination = () => {
    const { current, pages } = state.pagination;
    const pagination = [];

    for (let i = 1; i <= pages; i++) {
      pagination.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            current === i
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    return pagination;
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All CMS Pages</h2>
          <p className="text-gray-600">Manage your website pages</p>
        </div>
        <Link to="/cms/pages/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Page
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Filters</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Filter className="w-4 h-4 mr-1" />
            {showFilters ? "Hide" : "Show"} Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search pages..."
              value={state.filters.search}
              onChange={handleSearch}
              icon={Search}
            />
          </div>

          {showFilters && (
            <>
              <div className="w-full md:w-48">
                <select
                  value={state.filters.menuType}
                  onChange={(e) =>
                    handleFilterChange("menuType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Menu Types</option>
                  {state.menuTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-32">
                <select
                  value={state.filters.enabled}
                  onChange={(e) =>
                    handleFilterChange("enabled", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <Button variant="secondary" onClick={clearFilters}>
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {state.pages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No pages found</p>
            <Link to="/cms/pages/add" className="text-blue-600 hover:underline">
              Create your first page
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Page Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Menu Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.pages.map((page) => (
                    <tr key={page._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {page.pageTitle}
                          </div>
                          <div className="text-sm text-gray-500">
                            /{page.slug}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getMenuTypeName(page.menuType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(page._id)}
                          className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            page.isEnabled
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {page.isEnabled ? (
                            <Eye className="w-3 h-3 mr-1" />
                          ) : (
                            <EyeOff className="w-3 h-3 mr-1" />
                          )}
                          {page.isEnabled ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(page.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/cms/pages/edit/${page._id}`)
                            }
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setPageToDelete(page);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {state.pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() =>
                      handlePageChange(state.pagination.current - 1)
                    }
                    disabled={state.pagination.current === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      handlePageChange(state.pagination.current + 1)
                    }
                    disabled={
                      state.pagination.current === state.pagination.pages
                    }
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(state.pagination.current - 1) *
                          state.pagination.limit +
                          1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          state.pagination.current * state.pagination.limit,
                          state.pagination.total
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {state.pagination.total}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {renderPagination()}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Page"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete "{pageToDelete?.pageTitle}"? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AllPages;