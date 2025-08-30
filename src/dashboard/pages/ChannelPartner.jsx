import React, { useEffect, useState } from "react";
import { base_url } from "../../config/config";
import axios from "axios";
import {
  FaTrash,
  FaEye,
  FaSearch,
  FaDownload,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTag,
  FaCalendar,
  FaFilter
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ChannelPartner = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
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
        console.error("Error fetching partner data:", error);
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

  const openModal = (partner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPartner(null);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 font-medium">Loading partner data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Channel Partners
          </h1>
          <p className="text-gray-600">
            Manage and review all your channel partner applications
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, phone or location..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchTerm("")}
                >
                  <IoMdClose className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none w-full"
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
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <IoMdClose size={14} />
                    Clear
                  </button>
                )}
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <FaDownload className="text-sm" />
                  <span>Export</span>
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

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden mb-6 p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">No</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length ? (
                filteredData.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-medium">
                          <img src={item?.documents?.profileImage.url} alt={item?.fullname} />
                        </div>
                        <div className="font-medium text-gray-900">
                          {item?.fullname}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-900">{item?.email}</div>
                      <div className="text-gray-500">{item?.phone}</div>
                    </TableCell>
                    <TableCell>
                      {item?.city}, {item?.state}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {item?.partnerCategory}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openModal(item)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDeletePartner(item._id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Partner"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="7" className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-6">
                      <FaSearch className="text-gray-400 text-3xl mb-3" />
                      <p className="text-lg text-gray-500">
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
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View (cards) */}
        <div className="block md:hidden space-y-4">
          {filteredData.length ? (
            filteredData.map((item, index) => (
              <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                   <img src={item?.documents?.profileImage.url} alt={item?.fullname} />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">
                      {item?.fullname}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <div className="ml-auto hidden xxs:block">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {item?.partnerCategory}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="flex items-center mb-1">
                    <FaEnvelope className="text-blue-500 mr-2" />
                    {item.email}
                  </p>
                  <p className="flex items-center mb-1">
                    <FaPhone className="text-green-500 mr-2" />
                    {item.phone}
                  </p>
                  <p className="flex items-center">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    {item.city}, {item.state}
                  </p>
                  <div className="ml-auto mt-3 block xxs:hidden">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {item?.partnerCategory}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end mt-3 space-x-2">
                  <button
                    onClick={() => openModal(item)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleDeletePartner(item._id)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Partner"
                  >
                    <FaTrash />
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

        {/* Detail Modal */}
        {isModalOpen && selectedPartner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl">
                <h2 className="text-xl font-bold text-gray-800">
                  Partner Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <IoMdClose size={24} />
                </button>
              </div>

              <div className="p-3 xxs:p-4 xs:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FaUser className="text-blue-500 mr-2" /> Personal
                      Information
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedPartner?.fullname}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {selectedPartner?.email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedPartner?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FaMapMarkerAlt className="text-purple-500 mr-2" />{" "}
                      Location Details
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Location:</span>{" "}
                        {selectedPartner?.city}, {selectedPartner?.state}
                      </p>
                      <p>
                        <span className="font-medium">ZIP Code:</span>{" "}
                        {selectedPartner?.zipCode}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {formatDate(selectedPartner.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                    <FaTag className="text-green-500 mr-2" /> Partner Category
                  </h3>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                      {selectedPartner?.partnerCategory}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                    <FaEnvelope className="text-green-500 mr-2" /> Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: "profileImage", label: "Profile Image" },
                      { key: "panCard", label: "PAN Card" },
                      { key: "aadharFront", label: "Aadhar Front" },
                      { key: "aadharBack", label: "Aadhar Back" },
                    ].map(
                      (doc, index) =>
                        selectedPartner?.documents?.[doc.key]?.url && (
                          <div
                            key={index}
                            className="border rounded-lg p-4 transition-all hover:shadow-md"
                          >
                            <p className="text-sm font-medium text-gray-600 mb-2">
                              {doc.label}
                            </p>
                            <div className="relative group">
                              <img
                                src={selectedPartner.documents[doc.key].url}
                                alt={doc.label}
                                className="w-full h-48 object-contain rounded border cursor-pointer"
                                onClick={() =>
                                  downloadImage(
                                    selectedPartner.documents[doc.key].url,
                                    `${doc.label}-${selectedPartner.fullname}.jpg`
                                  )
                                }
                                style={{ cursor: "pointer" }}
                              />
                            </div>
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end rounded-b-xl">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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