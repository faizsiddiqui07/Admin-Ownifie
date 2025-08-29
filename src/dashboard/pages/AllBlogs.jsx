import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../config/config";
import toast from "react-hot-toast";
import { MdEdit, MdDelete } from "react-icons/md";

const AllBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [statusUpdating, setStatusUpdating] = useState("");
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/allBlog`);
      if (data.success) {
        setBlogs(data.data);
      } else {
        toast.error("Failed to load blogs");
      }
    } catch (err) {
      toast.error("Error fetching blogs");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (blog_id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        const { data } = await axios.delete(`${base_url}/api/blogDelete/${blog_id}`);
        if (data.success) {
          toast.success("Blog deleted");
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
        fetchBlogs();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating status");
    } finally {
      setStatusUpdating("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">All Blogs</h2>

      {blogs.length === 0 ? (
        <p className="text-gray-500">No blogs found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
            >
              <img
                src={blog.thumbnail?.url}
                alt={blog.title}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                {blog.title}
              </h3>
              <p className="text-gray-500 text-sm mb-2">{blog.date}</p>

              {/* Status Toggle */}
              <div className="mb-4">
                <span
                  onClick={() =>
                    handleStatusToggle(
                      blog._id,
                      blog.status === "active" ? "deactive" : "active"
                    )
                  }
                  className={`inline-block cursor-pointer px-3 py-1 rounded-full text-xs font-medium ${
                    blog.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {statusUpdating === blog._id ? "Updating..." : blog.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => navigate(`/dashboard/blog/edit/${blog.slug}`)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  <MdEdit />
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(blog._id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  <MdDelete />
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
