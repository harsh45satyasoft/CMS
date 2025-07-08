import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAppContext } from "../../context/AppContext";
import { cmsPageAPI, menuTypeAPI } from "../../services/api";
import toast from "react-hot-toast";
import Button from "../UI/Button";
import Input from "../UI/Input";
import { ArrowLeft, Save, Upload, X, FileText } from "lucide-react";

const AddPage = () => {
  const navigate = useNavigate();
  const { state, actions } = useAppContext();
  const [parentPages, setParentPages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pageTitle: "",
      slug: "",
      hasExtURL: false,
      hasFile: false,
      url: "",
      openInNewWindow: false,
      content: "",
      windowTitle: "",
      metaKeywords: "",
      metaDescription: "",
      isEnabled: true,
      menuType: "",
      parentId: "",
    },
  });

  const watchPageTitle = watch("pageTitle");
  const watchHasExtURL = watch("hasExtURL");
  const watchHasFile = watch("hasFile");

  useEffect(() => {
    fetchMenuTypes();
    fetchParentPages();
  }, []);

  // Auto-generate slug from page title
  useEffect(() => {
    if (watchPageTitle) {
      const slug = watchPageTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim("-");
      setValue("slug", slug);
    }
  }, [watchPageTitle, setValue]);

  const fetchMenuTypes = async () => {
    try {
      const response = await menuTypeAPI.getAll();
      actions.setMenuTypes(response.data);
    } catch (error) {
      toast.error("Failed to fetch menu types");
    }
  };

  const fetchParentPages = async () => {
    try {
      const response = await cmsPageAPI.getForDropdown();
      setParentPages(response.data);
    } catch (error) {
      console.error("Failed to fetch parent pages:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/gif",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "File type not supported. Please upload PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, or image files."
        );
        return;
      }

      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    // Reset file input
    const fileInput = document.getElementById("file-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();

      // Add all form fields to FormData
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      // Clean up data based on selection
      if (data.hasFile && selectedFile) {
        formData.append("file", selectedFile);
        formData.set("hasExtURL", false);
        formData.set("url", ""); // Will be set by backend
      } else if (data.hasExtURL) {
        formData.set("hasFile", false);
        formData.set("url", data.url);
      } else {
        formData.set("hasFile", false);
        formData.set("hasExtURL", false);
        formData.set("url", "");
      }

      // Set parentId to null if empty
      if (!data.parentId) {
        formData.set("parentId", "");
      }

      const response = await cmsPageAPI.createWithFile(formData);
      actions.addPage(response.data);
      toast.success("Page created successfully!");
      navigate("/cms/pages");
    } catch (error) {
      toast.error(error.message || "Failed to create page");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/cms/pages")}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add New Page</h2>
          <p className="text-gray-600">Create a new CMS page</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h3>

              <div className="space-y-4">
                <Input
                  label="Page Title *"
                  {...register("pageTitle", {
                    required: "Page title is required",
                    maxLength: {
                      value: 200,
                      message: "Page title cannot exceed 200 characters",
                    },
                  })}
                  error={errors.pageTitle?.message}
                />

                {/* Page Type Selection */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Page Type</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="pageType"
                        value="content"
                        defaultChecked
                        onChange={() => {
                          setValue("hasExtURL", false);
                          setValue("hasFile", false);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Content Page (Regular page with content)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="pageType"
                        value="external"
                        onChange={() => {
                          setValue("hasExtURL", true);
                          setValue("hasFile", false);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        External URL (Link to external website)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="pageType"
                        value="file"
                        onChange={() => {
                          setValue("hasFile", true);
                          setValue("hasExtURL", false);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        File Upload (PDF, DOC, etc.)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Hidden inputs for form state */}
                <input type="hidden" {...register("hasExtURL")} />
                <input type="hidden" {...register("hasFile")} />

                {/* External URL Fields */}
                {watchHasExtURL && (
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-medium text-gray-900 mb-3">
                      External URL Settings
                    </h4>
                    <div className="space-y-3">
                      <Input
                        label="External URL *"
                        type="url"
                        {...register("url", {
                          required: watchHasExtURL
                            ? "External URL is required"
                            : false,
                          maxLength: {
                            value: 500,
                            message: "URL cannot exceed 500 characters",
                          },
                        })}
                        error={errors.url?.message}
                        placeholder="https://example.com"
                      />

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          {...register("openInNewWindow")}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Open in new window
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Upload Fields */}
                {watchHasFile && (
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h4 className="font-medium text-gray-900 mb-3">
                      File Upload
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select File *
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            {selectedFile ? (
                              <div className="flex items-center space-x-3">
                                <FileText className="w-8 h-8 text-blue-500" />
                                <div className="text-left">
                                  <p className="text-sm font-medium text-gray-900">
                                    {selectedFile.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(selectedFile.size / 1024 / 1024).toFixed(
                                      2
                                    )}{" "}
                                    MB
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={removeFile}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                  <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                  >
                                    <span>Upload a file</span>
                                    <input
                                      id="file-upload"
                                      name="file-upload"
                                      type="file"
                                      className="sr-only"
                                      onChange={handleFileChange}
                                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT,
                                  Images up to 10MB
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content - Only show for content pages */}
            {!watchHasExtURL && !watchHasFile && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Content
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Content
                  </label>
                  <textarea
                    {...register("content")}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter page content..."
                  />
                </div>
              </div>
            )}

            <Input
              label="Slug *"
              {...register("slug", {
                required: "Slug is required",
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message:
                    "Slug can only contain lowercase letters, numbers, and hyphens",
                },
              })}
              error={errors.slug?.message}
              helpText="URL-friendly version of the page title"
            />

            {/* SEO Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                SEO Settings
              </h3>

              <div className="space-y-4">
                <Input
                  label="Window Title"
                  {...register("windowTitle", {
                    maxLength: {
                      value: 100,
                      message: "Window title cannot exceed 100 characters",
                    },
                  })}
                  error={errors.windowTitle?.message}
                  helpText="Title that appears in browser tab"
                />

                <Input
                  label="Meta Keywords"
                  {...register("metaKeywords", {
                    maxLength: {
                      value: 500,
                      message: "Meta keywords cannot exceed 500 characters",
                    },
                  })}
                  error={errors.metaKeywords?.message}
                  helpText="Comma-separated keywords"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    {...register("metaDescription", {
                      maxLength: {
                        value: 300,
                        message:
                          "Meta description cannot exceed 300 characters",
                      },
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description for search engines..."
                  />
                  {errors.metaDescription && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.metaDescription.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Page Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Page Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Menu Type *
                  </label>
                  <select
                    {...register("menuType", {
                      required: "Menu type is required",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select menu type</option>
                    {state.menuTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {errors.menuType && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.menuType.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Page
                  </label>
                  <select
                    {...register("parentId")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No parent</option>
                    {parentPages.map((page) => (
                      <option key={page._id} value={page._id}>
                        {page.pageTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register("isEnabled")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enabled
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Creating..." : "Create Page"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/cms/pages")}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPage;