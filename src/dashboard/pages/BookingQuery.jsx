import React, { useEffect, useState } from "react";
import { base_url } from "../../config/config";
import axios from "axios";
import { FaTrash, FaEye } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";

const BookingQuery = () => {
  const [data, setData] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBookingQuery = async () => {
      try {
        const response = await axios.get(`${base_url}/api/getAllBooking`);
        setData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching query data:", error);
        toast.error("Failed to fetch booking data");
      }
    };

    fetchBookingQuery();
  }, []);

  const handleDeleteBookingQuery = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(`${base_url}/api/deleteBookingQuery/${id}`);
        toast.success("Booking deleted successfully");
        setData(data.filter((item) => item._id !== id));
      } catch (error) {
        console.error("Error deleting booking:", error);
        toast.error("Failed to delete booking");
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
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Booking Queries</h1>

      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl shadow-md">
        <table className="min-w-full text-sm text-gray-800">
          <thead className="bg-blue-100 text-xs text-blue-800 uppercase">
            <tr>
              {[
                "No",
                "Full Name",
                "Email",
                "Phone",
                "Location",
                "Project Name",
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
                  <td className="px-4 py-2">{item?.user?.fullname}</td>
                  <td className="px-4 py-2">{item?.user?.email}</td>
                  <td className="px-4 py-2">{item?.user?.phone}</td>
                  <td className="px-4 py-2">
                    {item?.user?.city}, {item?.user?.state} -{" "}
                    {item?.user?.zipCode}
                  </td>
                  <td className="px-4 py-2">{item?.projectName}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-start gap-2">
                      <button
                        onClick={() => openModal(item)}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDeleteBookingQuery(item._id)}
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

      <div className="md:hidden space-y-4 mt-6">
        {data.length ? (
          data.map((item, index) => (
            <div
              key={item._id}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              <p className="text-blue-700 font-semibold mb-2">
                #{index + 1} - {item.projectName}
              </p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {item?.user?.fullname}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {item?.user?.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {item?.user?.phone}
                </p>
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {item?.user?.city}, {item?.user?.state} -{" "}
                  {item?.user?.zipCode}
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
                  onClick={() => handleDeleteBookingQuery(item._id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No booking queries found
          </div>
        )}
      </div>

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
              Booking Details
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <strong>Full Name:</strong>
                <p>{selectedQuery?.user?.fullname}</p>
              </div>
              <div>
                <strong>Email:</strong>
                <p>{selectedQuery?.user?.email}</p>
              </div>
              <div>
                <strong>Phone Number:</strong>
                <p>{selectedQuery?.user?.phone}</p>
              </div>
              <div>
                <strong>Project:</strong>
                <p>{selectedQuery?.projectName}</p>
              </div>
              <div>
                <strong>Project Type:</strong>
                <p>{selectedQuery?.projectType}</p>
              </div>
              <div>
                <strong>Square Feet:</strong>
                <p>{selectedQuery?.sqft}</p>
              </div>
              <div>
                <strong>Total Price:</strong>
                <p>{selectedQuery?.totalPrice}</p>
              </div>
              <div>
                <strong>Location:</strong>
                <p>
                  {selectedQuery?.user?.city}, {selectedQuery?.user?.state} -{" "}
                  {selectedQuery?.user?.zipCode}
                </p>
              </div>
              <div>
                <strong>Documents:</strong>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="font-medium text-gray-600">Profile Image</p>
                    <img
                      src={selectedQuery?.documents?.profileImage?.url}
                      alt="Profile"
                      className="rounded-lg border w-full h-64 object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">PAN Card</p>
                    <img
                      src={selectedQuery?.documents?.panCard?.url}
                      alt="PAN"
                      className="rounded-lg border w-full h-64 object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Aadhar Front</p>
                    <img
                      src={selectedQuery?.documents?.aadharFront?.url}
                      alt="Aadhar Front"
                      className="rounded-lg border w-full h-64 object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Aadhar Back</p>
                    <img
                      src={selectedQuery?.documents?.aadharBack?.url}
                      alt="Aadhar Back"
                      className="rounded-lg border w-full h-64 object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingQuery;
