import React, { useEffect, useState } from "react";
import { base_url } from "../../config/config";
import axios from "axios";
import {
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";

const ChannelPartner = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(false);

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${base_url}/api/getChannelPartners`);
        setData(response.data.data || []);
        setFilteredData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching query data:", error);
        toast.error("Failed to fetch partner data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartnerDetails();
  }, []);

  useEffect(() => {
    let results = data;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        (item) =>
          item.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phone?.includes(searchTerm) ||
          item.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.partnerCategory?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      results = results.filter(
        (item) => item.partnerCategory === selectedCategory
      );
    }

    setFilteredData(results);
    setActiveFilter(searchTerm || selectedCategory !== "All");
  }, [searchTerm, selectedCategory, data]);

  const handleDeletePartner = async (id) => {
    if (window.confirm("Are you sure you want to delete this partner?")) {
      try {
        await axios.delete(`${base_url}/api/deletePartner/${id}`);
        toast.success("Partner deleted successfully");
        setData(data.filter((item) => item._id !== id));
      } catch (error) {
        console.error("Error deleting partner:", error);
        toast.error("Failed to delete partner");
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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Location", "Category", "Date"];
    const csvData = filteredData.map((item) => [
      item.fullname,
      item.email,
      item.phone,
      `${item.city}, ${item.state} - ${item.zipCode}`,
      item.partnerCategory,
      new Date(item.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "channel-partners.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Data exported successfully");
  };

  const downloadImage = (imageUrl, fileName) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = fileName || "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(data.map((item) => item.partnerCategory))];
    return ["All", ...categories.filter(Boolean)];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 font-medium">Loading partner data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Channel Partners
            </h1>
            <p className="text-gray-600">
              Manage and review all your channel partner applications
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
            <FaPlus size={14} />
            Add Partner
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 transition-all hover:shadow-md">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {data.length}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Total Partners
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {data.length}
                </p>
              </div>
            </div>
          </div>

          {getUniqueCategories()
            .filter((cat) => cat !== "All")
            .slice(0, 3) // Limit to 3 categories for space
            .map((category, index) => {
              const count = data.filter(
                (item) => item.partnerCategory === category
              ).length;
              const colors = ["green", "purple", "orange"];
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 transition-all hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div
                      className={`rounded-full bg-${colors[index]}-100 p-3 mr-4`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-${colors[index]}-500 flex items-center justify-center`}
                      >
                        <span className="text-white text-xs font-bold">
                          {count}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {category}
                      </h3>
                      <p
                        className={`text-2xl font-bold text-${colors[index]}-600`}
                      >
                        {count}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search partners by name, email, phone, or location..."
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none w-full"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {getUniqueCategories().map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                {activeFilter && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <FaTimes size={14} />
                    Clear
                  </button>
                )}
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                  <FaDownload size={14} />
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing <span className="font-bold">{filteredData.length}</span> of{" "}
            <span className="font-bold">{data.length}</span> partners
          </p>
        </div>

        {/* Desktop Table with Fixed Width and Horizontal Scroll */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000]">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider whitespace-nowrap w-16">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider whitespace-nowrap w-64">
                    Full Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider whitespace-nowrap w-72">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider whitespace-nowrap w-40">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider whitespace-nowrap w-56">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider whitespace-nowrap w-48">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider whitespace-nowrap w-40">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider whitespace-nowrap w-40">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length ? (
                  filteredData.map((item, index) => (
                    <tr
                      key={item._id}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 w-16">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-64">
                        {item?.fullname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 w-72">
                        {item?.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 w-40">
                        {item?.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 w-56">
                        {item?.city}, {item?.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-48">
                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {item?.partnerCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-40">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-40">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal(item)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="View Details"
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePartner(item._id)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete Partner"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-gray-500"
                      style={{ minWidth: "1000px" }}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <FaSearch className="text-gray-400 text-3xl mb-3" />
                        <p className="text-lg">
                          {searchTerm || selectedCategory !== "All"
                            ? "No partners match your search criteria"
                            : "No partner applications found"}
                        </p>
                        {activeFilter && (
                          <button
                            onClick={clearFilters}
                            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredData.length ? (
            filteredData.map((item, index) => (
              <div
                key={item._id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-800 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      {item?.fullname?.charAt(0) || "P"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item?.fullname}
                      </h3>
                      <p className="text-sm text-gray-500">{item?.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {item?.partnerCategory}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="font-medium">{item?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Location</p>
                    <p className="font-medium">
                      {item?.city || "N/A"}, {item?.state || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Date</p>
                    <p className="font-medium">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(item)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    <FaEye size={14} /> View Details
                  </button>
                  <button
                    onClick={() => handleDeletePartner(item._id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-red-700 transition-colors"
                  >
                    <FaTrash size={14} /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <div className="text-gray-400 mb-4">
                <FaSearch size={40} className="mx-auto" />
              </div>
              <p className="text-gray-500 text-lg mb-2">
                {searchTerm || selectedCategory !== "All"
                  ? "No partners match your search criteria"
                  : "No partner applications found"}
              </p>
              {activeFilter && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && selectedQuery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  Partner Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <IoMdClose size={24} />
                </button>
              </div>

              <div className="overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Full Name
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedQuery?.fullname}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">{selectedQuery?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Phone Number
                      </label>
                      <p className="text-gray-900">{selectedQuery?.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Partner Category
                      </label>
                      <p className="text-gray-900">
                        {selectedQuery?.partnerCategory}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Location
                      </label>
                      <p className="text-gray-900">
                        {selectedQuery?.city}, {selectedQuery?.state} -{" "}
                        {selectedQuery?.zipCode}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Application Date
                      </label>
                      <p className="text-gray-900">
                        {new Date(selectedQuery.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: "profileImage", label: "Profile Image" },
                      { key: "panCard", label: "PAN Card" },
                      { key: "aadharFront", label: "Aadhar Front" },
                      { key: "aadharBack", label: "Aadhar Back" },
                    ].map(
                      (doc, index) =>
                        selectedQuery?.documents?.[doc.key]?.url && (
                          <div
                            key={index}
                            className="border rounded-lg p-4 transition-all hover:shadow-md"
                          >
                            <p className="text-sm font-medium text-gray-600 mb-2">
                              {doc.label}
                            </p>
                            <div className="relative group">
                              <img
                                src={selectedQuery.documents[doc.key].url}
                                alt={doc.label}
                                className="w-full h-48 object-contain rounded border cursor-pointer"
                                onClick={() =>
                                  downloadImage(
                                    selectedQuery.documents[doc.key].url,
                                    `${doc.label}-${selectedQuery.fullname}.jpg`
                                  )
                                }
                                style={{ cursor: "pointer" }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                                <span className="text-white bg-black bg-opacity-50 px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                  Click to download
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t p-4 bg-gray-50 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelPartner;
