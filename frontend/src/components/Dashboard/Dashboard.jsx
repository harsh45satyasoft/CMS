import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { cmsPageAPI, menuTypeAPI } from "../../services/api";
import { FileText, Eye, EyeOff, Menu, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { state, actions } = useAppContext();
  const [stats, setStats] = useState({
    totalPages: 0,
    enabledPages: 0,
    disabledPages: 0,
    menuTypes: 0,
    loading: true,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      actions.setLoading(true);

      // Fetch all pages without pagination to get total count
      const pagesResponse = await cmsPageAPI.getAll({ limit: 1000 });
      const menuTypesResponse = await menuTypeAPI.getAll();

      const pages = pagesResponse.data || [];
      const menuTypes = menuTypesResponse.data || [];

      const enabledPages = pages.filter((page) => page.isEnabled).length;
      const disabledPages = pages.filter((page) => !page.isEnabled).length;

      setStats({
        totalPages: pages.length,
        enabledPages,
        disabledPages,
        menuTypes: menuTypes.length,
        loading: false,
      });

      // Update context state
      actions.setPages(pages);
      actions.setMenuTypes(menuTypes);
      actions.setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
      setStats((prev) => ({ ...prev, loading: false }));
      actions.setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>
            {stats.loading ? "..." : value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        <span className="text-sm text-gray-500">Dashboard stats</span>
      </div>
    </div>
  );

  const RecentPages = () => {
    const recentPages = state.pages.slice(0, 5);

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Pages
        </h3>
        {recentPages.length > 0 ? (
          <div className="space-y-3">
            {recentPages.map((page) => (
              <div
                key={page._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {page.pageTitle}
                    </p>
                    <p className="text-xs text-gray-500">{page.slug}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      page.isEnabled
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {page.isEnabled ? "Enabled" : "Disabled"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {page.menuType?.name || "No Menu Type"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No pages found</p>
          </div>
        )}
      </div>
    );
  };

  const QuickActions = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => (window.location.href = "/cms/pages/add")}
          className="flex items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
        >
          <FileText className="w-5 h-5 mr-2" />
          Add New Page
        </button>
        <button
          onClick={() => (window.location.href = "/cms/pages")}
          className="flex items-center justify-center p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
        >
          <Eye className="w-5 h-5 mr-2" />
          View All Pages
        </button>
        <button
          onClick={() => (window.location.href = "/menu-types")}
          className="flex items-center justify-center p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 mr-2" />
          Manage Menu Types
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to CMS Dashboard
        </h2>
        <p className="text-gray-600">
          Manage your website content, pages, and menu types from this central
          dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pages"
          value={stats.totalPages}
          icon={FileText}
          color="text-blue-600"
          bgColor="bg-blue-500"
        />
        <StatCard
          title="Enabled Pages"
          value={stats.enabledPages}
          icon={Eye}
          color="text-green-600"
          bgColor="bg-green-500"
        />
        <StatCard
          title="Disabled Pages"
          value={stats.disabledPages}
          icon={EyeOff}
          color="text-red-600"
          bgColor="bg-red-500"
        />
        <StatCard
          title="Menu Types"
          value={stats.menuTypes}
          icon={Menu}
          color="text-purple-600"
          bgColor="bg-purple-500"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentPages />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchDashboardStats}
          disabled={stats.loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {stats.loading ? "Refreshing..." : "Refresh Dashboard"}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;