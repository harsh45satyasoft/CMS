import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  X,
  Upload,
  FileText,
  Download,
  Trash2,
} from "lucide-react";
import { cmsPageAPI, menuTypeAPI } from "../../services/api";
import { useAppContext } from "../../context/AppContext";
import Button from "../UI/Button";
import Input from "../UI/Input";

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useAppContext();
  const [menuTypes, setMenuTypes] = useState([]);
  const [parentPages, setParentPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [removeFile, setRemoveFile] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm();

  const hasExtURL = watch("hasExtURL");
  const hasFile = watch("hasFile");

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [pageData, menuTypesData, parentPagesData] = await Promise.all([
        cmsPageAPI.getById(id),
        menuTypeAPI.getAll(),
        cmsPageAPI.getForDropdown(),
      ]);

      if (pageData.success) {
        const page = pageData.data;
        // Set form values
        reset({
          pageTitle: page.pageTitle,
          slug: page.slug,
          hasExtURL: page.hasExtURL,
          hasFile: page.hasFile,
          url: page.url || "",
          openInNewWindow: page.openInNewWindow,
          content: page.content || "",
          windowTitle: page.windowTitle || "",
          metaKeywords: page.metaKeywords || "",
          metaDescription: page.metaDescription || "",
          isEnabled: page.isEnabled,
          menuType: page.menuType._id,
          parentId: page.parentId?._id || "",
          orderId: page.orderId,
        });

        // Set existing file info
        if (page.hasFile) {
          setExistingFile({
            fileName: page.fileName,
            originalFileName: page.originalFileName,
            fileSize: page.fileSize,
            fileMimeType: page.fileMimeType,
            fileUrl: page.fileUrl,
          });
        }
      }

      if (menuTypesData.success) {
        setMenuTypes(menuTypesData.data);
      }

      if (parentPagesData.success) {
        // Filter out current page from parent options
        setParentPages(parentPagesData.data.filter((p) => p._id !== id));
      }
    } catch (error) {
      toast.error("Failed to fetch page data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB)
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
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, and image files are allowed."
        );
        return;
      }

      setSelectedFile(file);
      setRemoveFile(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setRemoveFile(true);
    document.getElementById("file-input").value = "";
  };

  const handleDownloadFile = async () => {
    try {
      const response = await cmsPageAPI.downloadFile(id);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", existingFile.originalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const onSubmit = async (data) => {
    try {
      actions.setLoading(true);

      // Generate slug if not provided
      if (!data.slug && data.pageTitle) {
        data.slug = generateSlug(data.pageTitle);
      }

      // Handle external URL logic
      if (!data.hasExtURL) {
        data.url = "";
      }

      // Handle file upload logic
      if (!data.hasFile) {
        data.hasFile = false;
      }

      // Handle parent page
      if (!data.parentId) {
        data.parentId = null;
      }

      let response;

      // Check if we need to upload a file or remove existing file
      if (selectedFile || removeFile) {
        const formData = new FormData();

        // Append form data
        Object.keys(data).forEach((key) => {
          if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
          }
        });

        // Append file if selected
        if (selectedFile) {
          formData.append("file", selectedFile);
        }

        // If removing file, set hasFile to false
        if (removeFile) {
          formData.set("hasFile", "false");
        }

        response = await cmsPageAPI.updateWithFile(id, formData);
      } else {
        response = await cmsPageAPI.update(id, data);
      }

      if (response.success) {
        actions.updatePage(response.data);
        toast.success("Page updated successfully!");
        navigate("/cms/pages");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update page");
      console.error("Error updating page:", error);
    } finally {
      actions.setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate("/cms/pages")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pages</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Edit CMS Page</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Page Title"
                {...register("pageTitle", {
                  required: "Page title is required",
                  maxLength: {
                    value: 200,
                    message: "Page title cannot exceed 200 characters",
                  },
                })}
                error={errors.pageTitle?.message}
                onChange={(e) => {
                  const title = e.target.value;
                  setValue("pageTitle", title);
                  if (!watch("slug")) {
                    setValue("slug", generateSlug(title));
                  }
                }}
              />
            </div>

            <Input
              label="Slug"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu Type
              </label>
              <select
                {...register("menuType", {
                  required: "Menu type is required",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Menu Type</option>
                {menuTypes.map((type) => (
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Page (Optional)
              </label>
              <select
                {...register("parentId")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No Parent</option>
                {parentPages.map((page) => (
                  <option key={page._id} value={page._id}>
                    {page.pageTitle}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Order ID"
              type="number"
              {...register("orderId", {
                min: { value: 0, message: "Order ID must be non-negative" },
              })}
              error={errors.orderId?.message}
              helpText="Lower numbers appear first in menus"
            />
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("hasExtURL")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                This page has an external URL
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("hasFile")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                This page has a file attachment
              </label>
            </div>

            {hasExtURL && (
              <>
                <Input
                  label="External URL"
                  type="url"
                  {...register("url", {
                    required:
                      hasExtURL && !hasFile
                        ? "URL is required for external pages"
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
                  <label className="ml-2 block text-sm text-gray-700">
                    Open in new window
                  </label>
                </div>
              </>
            )}

            {hasFile && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Upload
                  </label>

                  {/* Existing file display */}
                  {existingFile && !removeFile && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {existingFile.originalFileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(existingFile.fileSize)} •{" "}
                              {existingFile.fileMimeType}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadFile}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File input */}
                  <div className="relative">
                    <input
                      id="file-input"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                      className="hidden"
                    />
                    <label
                      htmlFor="file-input"
                      className="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {selectedFile
                            ? "Replace file"
                            : "Click to upload file"}
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, or Images
                          (Max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Selected file preview */}
                  {selectedFile && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(selectedFile.size)} •{" "}
                              {selectedFile.type}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            document.getElementById("file-input").value = "";
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {hasFile && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register("openInNewWindow")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Open file in new window
                    </label>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("isEnabled")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Page is enabled
              </label>
            </div>
          </div>
        </div>

        {!hasExtURL && !hasFile && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Content</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Content
              </label>
              <textarea
                {...register("content")}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter page content..."
              />
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            SEO Settings
          </h2>

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
              helpText="Title shown in browser tab"
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
              helpText="Comma-separated keywords for SEO"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                {...register("metaDescription", {
                  maxLength: {
                    value: 300,
                    message: "Meta description cannot exceed 300 characters",
                  },
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description for search engines..."
              />
              {errors.metaDescription && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.metaDescription.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Recommended: 150-160 characters
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/cms/pages")}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </Button>
          <Button
            type="submit"
            disabled={state.loading}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{state.loading ? "Updating..." : "Update Page"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditPage;