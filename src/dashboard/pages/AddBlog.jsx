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

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const uploaded = await uploadImage(file);
      if (uploaded?.url) {
        setThumbnail({ url: uploaded.url, public_id: uploaded.public_id });
        toast.success("Thumbnail uploaded");
      }
    } catch {
      toast.error("Thumbnail upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !thumbnail || !content)
      return toast.error("All fields required");

    try {
      const res = await axios.post(`${base_url}/api/addBlog`, {
        title,
        thumbnail,
        content,
      });

      if (res.data.success) {
        toast.success("Blog published!");
        navigate("/dashboard/allBlogs");
      } else {
        toast.error("Blog creation failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
     <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Add Blog
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow space-y-8"
      >
        {/* Title */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Blog Title
          </label>
          <input
            type="text"
            placeholder="Enter Blog Title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Thumbnail
          </label>
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
                className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full text-sm"
              >
                ×
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
            />
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Content
          </label>
          <div className="">
            <BlogEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* Submit */}
        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 mt-10 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            Publish Blog
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBlog;
