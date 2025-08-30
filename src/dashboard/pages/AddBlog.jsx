import { useState } from "react";
import { useNavigate } from "react-router-dom";
import uploadImage from "../helpers/uploadImage";
import BlogEditor from "../components/BlogEditor";
import axios from "axios";
import { base_url } from "../../config/config";
import toast from "react-hot-toast";

const AddBlog = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      return toast.error("Please select a valid image (JPEG, PNG, WEBP, GIF)");
    }
    
    if (file.size > maxSize) {
      return toast.error("Image size must be less than 5MB");
    }
    
    setIsUploading(true);
    try {
      const uploaded = await uploadImage(file);
      if (uploaded?.url) {
        setThumbnail({ url: uploaded.url, public_id: uploaded.public_id });
        toast.success("Thumbnail uploaded successfully");
      }
    } catch {
      toast.error("Thumbnail upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !thumbnail || !content) {
      return toast.error("Please fill all required fields");
    }

    setIsPublishing(true);
    try {
      const res = await axios.post(`${base_url}/api/addBlog`, {
        title,
        thumbnail,
        content,
      });

      if (res.data.success) {
        toast.success("Blog published successfully!");
        navigate("/dashboard/allBlogs");
      } else {
        toast.error("Blog creation failed");
      }
    } catch (error) {
      console.error("Publishing error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className=" max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Create New Blog</h2>
        <p className="text-gray-600 mt-2">Write and publish a new blog post</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-md space-y-6">
        {/* Title */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Blog Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter a compelling title for your blog"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-all"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Thumbnail Image <span className="text-red-500">*</span>
          </label>
          
          {thumbnail ? (
            <div className="relative w-fit mb-4">
              <img
                src={thumbnail.url}
                alt="Thumbnail preview"
                className="w-40 h-40 object-cover rounded-lg shadow-md"
              />
              <button
                type="button"
                onClick={() => setThumbnail(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full text-sm hover:bg-red-600 transition-colors"
                aria-label="Remove thumbnail"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <div className="flex flex-col items-center justify-center space-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600">Upload a thumbnail image</p>
                <p className="text-sm text-gray-500">JPEG, PNG, WEBP or GIF (Max 5MB)</p>
                <label className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-200 transition-colors mt-2">
                  {isUploading ? "Uploading..." : "Select Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Content <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <BlogEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/dashboard/allBlogs")}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPublishing || !title || !thumbnail || !content}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isPublishing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </>
            ) : (
              "Publish Blog"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBlog;