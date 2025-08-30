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
  TableCaption,
} from "@/components/ui/table";

const ContactQuerry = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContactQuery = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${base_url}/api/getAllqueries`);
        setData(response.data.data || []);
        setFilteredData(response.data.data || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching query data:", error);
        toast.error("Failed to fetch query data");
        setIsLoading(false);
      }
    };

    fetchContactQuery();
  }, []);

  useEffect(() => {
    let results = data;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        (item) =>
          item?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(item?.phoneNumber || "").includes(searchTerm) ||
          item?.projectId?.projectName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(results);
  }, [searchTerm, data]);

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

  const exportData = () => {
    const dataToExport = filteredData.map((item) => ({
      "Full Name": item?.fullName,
      Email: item?.email,
      Phone: item?.phoneNumber,
      Message: item?.message,
      Project: item?.projectId?.projectName || "Other Query",
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        Object.keys(dataToExport[0]).join(","),
        ...dataToExport.map((item) => Object.values(item).join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `contact_queries_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Data exported successfully");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Contact Queries
          </h1>
          <p className="text-gray-600">
            Manage and review all customer contact inquiries
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
                placeholder="Search by name, email, phone or project..."
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

            <button
              onClick={exportData}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <FaDownload className="text-sm" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Desktop Table with Shadcn Component */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden mb-6 p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan="6" className="h-24 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-2 text-gray-500">
                      Loading contact data...
                    </p>
                  </TableCell>
                </TableRow>
              ) : filteredData.length ? (
                filteredData.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {item?.fullName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-900">{item?.email}</div>
                      <div className="text-gray-500">{item?.phoneNumber}</div>
                    </TableCell>
                    <TableCell>
                      {item.projectId?.projectName || "Other Query"}
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
                          onClick={() => handleDeleteContactQuery(item._id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Query"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="6" className="h-24 text-center">
                    No contact queries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View (cards) */}
        <div className="block md:hidden space-y-4">
          {isLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading contact data...</p>
            </div>
          ) : filteredData.length ? (
            filteredData.map((item, index) => (
              <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600 text-xl" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">
                      {item.fullName}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="flex items-center mb-1">
                    <FaEnvelope className="text-blue-500 mr-2" />
                    {item.email}
                  </p>
                  <p className="flex items-center mb-1">
                    <FaPhone className="text-green-500 mr-2" />
                    {item.phoneNumber}
                  </p>
                  <p className="flex items-center">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    {item.projectId?.projectName || "Other Query"}
                  </p>
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
                    onClick={() => handleDeleteContactQuery(item._id)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Query"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No contact queries found
            </p>
          )}
        </div>

        {/* Detail Modal */}
        {isModalOpen && selectedQuery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl">
                <h2 className="text-xl font-bold text-gray-800">
                  Contact Query Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <IoMdClose size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FaUser className="text-blue-500 mr-2" /> Contact
                      Information
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedQuery?.fullName}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {selectedQuery?.email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedQuery?.phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FaMapMarkerAlt className="text-purple-500 mr-2" />{" "}
                      Project Details
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Project:</span>{" "}
                        {selectedQuery?.projectId?.projectName || "Other Query"}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {formatDate(selectedQuery.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                    <FaEnvelope className="text-green-500 mr-2" /> Message
                  </h3>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="whitespace-pre-line">
                      {selectedQuery?.message}
                    </p>
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

export default ContactQuerry;
