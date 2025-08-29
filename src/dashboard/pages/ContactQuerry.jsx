import React, { useEffect, useState } from "react";
import { base_url } from "../../config/config";
import axios from "axios";
import { FaTrash, FaEye } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";

const ContactQuerry = () => {
  const [data, setData] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchContactQuery = async () => {
      try {
        const response = await axios.get(`${base_url}/api/getAllqueries`);
        setData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching query data:", error);
        toast.error("Failed to fetch query data");
      }
    };

    fetchContactQuery();
  }, []);

  const handleDeleteContactQuery = async (id) => {
    if (window.confirm("Are you sure you want to delete this Query?")) {
      try {
        await axios.delete(`${base_url}/api/deleteQuery/${id}`);
        toast.success("Query deleted successfully");
        setData(data.filter((item) => item._id !== id));
      } catch (error) {
        console.error("Error deleting Query:", error);
        toast.error("Failed to delete Query");
      }
    }
  };

  const openModal = (query) => {
    setSelectedQuery(query);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuery(null);
  };

  return (
    <div
      className={`w-full px-4 py-8 bg-gradient-to-br from-blue-50 to-white min-h-screen ${
        isModalOpen ? "fixed z-40" : ""
      }`}
    >
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Contact Queries</h1>

      {/* Table for md+ screens */}
      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl shadow-md">
        <table className="min-w-full text-sm text-gray-800">
          <thead className="bg-blue-100 text-xs text-blue-800 uppercase">
            <tr>
              {[
                "No",
                "Full Name",
                "Email",
                "Phone",
                "Message",
                "Project",
                "Actions",
              ].map((title, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((item, index) => (
                <tr
                  key={item._id}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.fullName}</td>
                  <td className="px-4 py-2">{item.email}</td>
                  <td className="px-4 py-2">{item.phoneNumber}</td>
                  <td className="px-4 py-2 truncate max-w-[200px]">
                    {item.message}
                  </td>
                  <td className="px-4 py-2">
                    {item.projectId?.projectName || "Other Query"}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-start gap-2">
                      <button
                        onClick={() => openModal(item)}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDeleteContactQuery(item._id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout for < md */}
      <div className="md:hidden space-y-4 mt-6">
        {data.length ? (
          data.map((item, index) => (
            <div
              key={item._id}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              <p className="text-blue-700 font-semibold mb-2">
                #{index + 1} - {item.projectId?.projectName || "Other Query"}
              </p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Name:</span> {item.fullName}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {item.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span> {item.phoneNumber}
                </p>
                <p>
                  <span className="font-semibold">Message:</span>
                  <span
                    className="block text-gray-600 line-clamp-2"
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      overflow: "hidden",
                    }}
                  >
                    {item.message}
                  </span>
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openModal(item)}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                >
                  <FaEye /> View
                </button>
                <button
                  onClick={() => handleDeleteContactQuery(item._id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No contact queries found
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-h-[90vh] overflow-y-auto rounded-xl shadow-xl w-full max-w-3xl p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              <IoMdClose size={24} />
            </button>
            <h2 className="text-2xl font-bold text-blue-700 mb-4 border-b pb-2">
              Query Details
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <strong className="block text-gray-600">Full Name:</strong>
                <p>{selectedQuery.fullName}</p>
              </div>
              <div>
                <strong className="block text-gray-600">Email:</strong>
                <p>{selectedQuery.email}</p>
              </div>
              <div>
                <strong className="block text-gray-600">Phone Number:</strong>
                <p>{selectedQuery.phoneNumber}</p>
              </div>
              <div>
                <strong className="block text-gray-600">Project:</strong>
                <p>{selectedQuery.projectId?.projectName || "Other Query"}</p>
              </div>
              <div>
                <strong className="block text-gray-600">Message:</strong>
                <p className="whitespace-pre-line bg-gray-50 p-3 rounded-lg mt-1">
                  {selectedQuery.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactQuerry;