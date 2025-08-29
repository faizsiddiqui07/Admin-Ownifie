import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../config/config";
import toast from "react-hot-toast";
import BlogEditor from "../components/BlogEditor";
import uploadImage from "../helpers/uploadImage";

const EditBlog = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [blogId, setBlogId] = useState(null);

  // Fetch existing blog
  const fetchBlog = async () => {
    try {
      const { data } = await axios.post(`${base_url}/api/blogDetails`, {
        blogSlug: slug,
      });

      const blog = data.data;
      setTitle(blog.title);
      setThumbnail(blog.thumbnail);
      setContent(blog.content);
      setBlogId(blog._id);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch blog");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchBlog();
  }, [slug]);

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const uploaded = await uploadImage(file);
      if (uploaded?.url) {
        setThumbnail({ url: uploaded.url, public_id: uploaded.public_id });
        toast.success("Thumbnail updated");
      }
    } catch (err) {
      toast.error("Failed to upload thumbnail");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title || !thumbnail || !content) {
      return toast.error("Please fill in all fields");
    }

    try {
      const { data } = await axios.put(`${base_url}/api/updateBlog/${blogId}`, {
        title,
        thumbnail,
        content,
      });

      if (data.success) {
        toast.success("Blog updated");
        navigate("/dashboard/allBlogs");
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  if (loading) return <p className="text-center py-10">Loading blog...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        Edit Blog
      </h2>

      <form onSubmit={handleUpdate} className="space-y-6 bg-white p-6 rounded-xl shadow-md">
        {/* Title */}
        <input
          type="text"
          placeholder="Enter Blog Title"
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Thumbnail */}
        <div>
          <label className="font-medium block mb-2">Thumbnail</label>
          {thumbnail ? (
            <div className="relative w-fit">
              <img
                src={thumbnail.url}
                alt="Thumbnail"
                className="w-32 h-32 object-cover rounded shadow"
              />
              <button
                type="button"
                onClick={() => setThumbnail(null)}
                className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full"
              >
                ×
              </button>
            </div>
          ) : (
            <input type="file" accept="image/*" onChange={handleThumbnailUpload} />
          )}
        </div>

        {/* Blog Content */}
        <div className="h-full">
          <label className="font-medium block mb-2">Blog Content</label>
          <BlogEditor value={content} onChange={setContent} />
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 mt-10 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            Update Blog
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBlog;
