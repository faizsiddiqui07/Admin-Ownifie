import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../config/config";
import toast from "react-hot-toast";
import { MdEdit, MdDelete, MdSearch, MdFilterList } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";

const AllBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [statusUpdating, setStatusUpdating] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${base_url}/api/allBlog`);
      
      if (data.success) {
        setBlogs(data.data);
        setFilteredBlogs(data.data);
      } else {
        toast.error("Failed to load blogs");
      }
    } catch (err) {
      toast.error("Error fetching blogs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter and sort blogs
  useEffect(() => {
    let result = [...blogs];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(blog => 
        blog.title.toLowerCase().includes(query) || 
        (blog.content && blog.content.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(blog => blog.status === statusFilter);
    }
    
    // Apply sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    setFilteredBlogs(result);
  }, [blogs, searchQuery, statusFilter, sortBy]);

  const handleDelete = async (blog_id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        const { data } = await axios.delete(`${base_url}/api/blogDelete/${blog_id}`);
        if (data.success) {
          toast.success("Blog deleted successfully");
          setBlogs((prev) => prev.filter((b) => b._id !== blog_id));
        } else {
          toast.error("Failed to delete blog");
        }
      } catch (err) {
        toast.error("Error deleting blog");
      }
    }
  };

  const handleStatusToggle = async (blog_id, newStatus) => {
    try {
      setStatusUpdating(blog_id);
      const { data } = await axios.put(
        `${base_url}/api/blog/status-update/${blog_id}`,
        {
          status: newStatus,
        }
      );

      if (data.success) {
        toast.success(data.message);
        // Update the specific blog's status without refetching all
        setBlogs(prev => prev.map(blog => 
          blog._id === blog_id ? {...blog, status: newStatus} : blog
        ));
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating status");
    } finally {
      setStatusUpdating("");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="py-2 sm:py-4 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Blog Management</h2>
          <p className="text-gray-500 mt-2">Manage all your blog posts in one place</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/blog/add")}
          className="mt-4 md:mt-0 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
        >
          + Add New Blog
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search blogs by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-center sm:items-start gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="deactive">Inactive</option>
              </select>
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          Showing {filteredBlogs.length} of {blogs.length} blog posts
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white p-4 rounded-xl shadow-sm">
              <div className="animate-pulse">
                <div className="bg-gray-200 h-40 rounded-md mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MdSearch size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No blogs found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "Get started by adding your first blog post"}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <div className="relative">
                <img
                  src={blog.thumbnail?.url || "/api/placeholder/300/200"}
                  alt={blog.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() =>
                      handleStatusToggle(
                        blog._id,
                        blog.status === "active" ? "deactive" : "active"
                      )
                    }
                    disabled={statusUpdating === blog._id}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      blog.status === "active"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    } transition-colors`}
                  >
                    {statusUpdating === blog._id ? (
                      "Updating..."
                    ) : (
                      <>
                        {blog.status === "active" ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                        {blog.status === "active" ? "Active" : "Inactive"}
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                {blog.title}
              </h3>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>{formatDate(blog.date || blog.createdAt)}</span>
                {blog.author && (
                  <>
                    <span className="mx-2">•</span>
                    <span>By {blog.author}</span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => navigate(`/dashboard/blog/edit/${blog.slug}`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex-1 justify-center"
                >
                  <MdEdit size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(blog._id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex-1 justify-center"
                >
                  <MdDelete size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllBlogs;