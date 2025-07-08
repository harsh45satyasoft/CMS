import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { menuTypeAPI } from "../../services/api";
import toast from "react-hot-toast";
import Button from "../UI/Button";
import { Plus, Edit, Trash2 } from "lucide-react";

const AllMenuTypes = () => {
  const { state, actions } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMenuType, setEditingMenuType] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMenuTypes();
  }, []);

  const fetchMenuTypes = async () => {
    try {
      setLoading(true);
      const response = await menuTypeAPI.getAll();
      actions.setMenuTypes(response.data);
    } catch (error) {
      toast.error("Failed to fetch menu types");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: "" });
    setShowAddModal(true);
  };

  const handleEdit = (menuType) => {
    setEditingMenuType(menuType);
    setFormData({ name: menuType.name });
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Menu type name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingMenuType) {
        // Update existing menu type
        const response = await menuTypeAPI.update(
          editingMenuType._id,
          formData
        );
        const updatedMenuTypes = state.menuTypes.map((type) =>
          type._id === editingMenuType._id ? response.data : type
        );
        actions.setMenuTypes(updatedMenuTypes);
        toast.success("Menu type updated successfully!");
        setShowEditModal(false);
      } else {
        // Create new menu type
        const response = await menuTypeAPI.create(formData);
        actions.setMenuTypes([...state.menuTypes, response.data]);
        toast.success("Menu type created successfully!");
        setShowAddModal(false);
      }

      setFormData({ name: "" });
      setEditingMenuType(null);
    } catch (error) {
      toast.error(error.message || "Failed to save menu type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await menuTypeAPI.delete(id);
      const updatedMenuTypes = state.menuTypes.filter(
        (type) => type._id !== id
      );
      actions.setMenuTypes(updatedMenuTypes);
      toast.success("Menu type deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete menu type");
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setFormData({ name: "" });
    setEditingMenuType(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading menu types...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Types</h2>
          <p className="text-gray-600">Manage your menu type categories</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Type
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pages Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {state.menuTypes.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No menu types found
                </td>
              </tr>
            ) : (
              state.menuTypes.map((menuType, index) => (
                <tr key={menuType._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {menuType.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    0
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(menuType)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(menuType._id, menuType.name)
                        }
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Menu Type
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter menu type name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={closeModals}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Menu Type
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter menu type name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={closeModals}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllMenuTypes;