import React, { useRef, useState } from "react";
import { MdClose, MdDelete } from "react-icons/md";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import toast from "react-hot-toast";
import axios from "axios";
import uploadImage from "../helpers/uploadImage";
import DisplayImage from "../components/DisplayImage";
import { base_url } from "../../config/config";
import { useEffect } from "react";

const AddProject = () => {
  const navigate = useNavigate();
  const editor = useRef(null);
  const amenityRef = useRef();
  const [showAmenitySuggestions, setShowAmenitySuggestions] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState();
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [amenityInput, setAmenityInput] = useState("");

  const [data, setData] = useState({
    projectName: "",
    projectAddress: "",
    projectOverview: "",
    landArea: "",
    builtUpArea: "",
    functionality: [],
    amenities: [],
    targetIRR: "",
    peRatio: "",
    possessionStatus: "",
    targetRentalYield: "",
    projectAmount: "",
    bookingAmount: "",
    ownershipPlan: {
      firstInstallment: "",
      secondInstallment: "",
      thirdInstallment: "",
      fourthInstallment: "",
      fifthInstallment: "",
      sixthInstallment: "",
      seventhInstallment: "",
    },
    unitBreakdown: {
      wholeUnit: {
        totalPropertyValue: "",
        gst: "",
        stampDuty: "",
        furnishingCost: "",
        conveyanceFees: "",
        facilitationCharges: "",
        total: "",
      },
      singleUnit: {
        totalPropertyValue: "",
        gst: "",
        stampDuty: "",
        furnishingCost: "",
        conveyanceFees: "",
        facilitationCharges: "",
        total: "",
      },
    },
    projectImages: [],
    projectStatus: "",
    interiorStatus: "",
    projectType: "",
    description: "",
  });

  const [farmHouse, setFarmHouse] = useState({
    bsp: { squareFeet: "", rate: "", total: 0 },
    idc: { squareFeet: "", rate: "", total: 0 },
    servicesAndAmenities: { squareFeet: "", rate: "", total: 0 },
    farmHouseModule: "",
    modulePrice: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    const calc = (sqft, rate) => parseFloat(sqft || 0) * parseFloat(rate || 0);

    const bspTotal = calc(farmHouse.bsp.squareFeet, farmHouse.bsp.rate);
    const idcTotal = calc(farmHouse.idc.squareFeet, farmHouse.idc.rate);
    const amenityTotal = calc(
      farmHouse.servicesAndAmenities.squareFeet,
      farmHouse.servicesAndAmenities.rate
    );

    let modulePrice = 0;
    if (farmHouse.farmHouseModule === "Module1") modulePrice = 500000;
    if (farmHouse.farmHouseModule === "Module2") modulePrice = 800000;

    const total = bspTotal + idcTotal + amenityTotal + modulePrice;

    setFarmHouse((prev) => ({
      ...prev,
      bsp: { ...prev.bsp, total: bspTotal },
      idc: { ...prev.idc, total: idcTotal },
      servicesAndAmenities: {
        ...prev.servicesAndAmenities,
        total: amenityTotal,
      },
      modulePrice,
      grandTotal: total,
    }));
  }, [
    farmHouse.bsp.squareFeet,
    farmHouse.bsp.rate,
    farmHouse.idc.squareFeet,
    farmHouse.idc.rate,
    farmHouse.servicesAndAmenities.squareFeet,
    farmHouse.servicesAndAmenities.rate,
    farmHouse.farmHouseModule,
  ]);

  const commonAmenities = [
    "Club House",
    "Community Office",
    "Gymnasium",
    "Yoga Garden",
    "Children Play Zone",
    "Bonfire Place",
    "Landscaped Seating Area",
    "Outdoor Gym",
    "Adventure Activities",
    "Concierge Services",
    "CCTV Surveillance",
    "Electric Transmission",
    "Home Automation System",
    "Parking",
    "Security",
    "Lift",
    "Garden",
    "Indoor Games Room",
    "Jogging Track",
    "Spa",
    "Fire",
    "Swimming Pool",
  ];

  const handleAddAmenity = (amenity) => {
    if (!data.amenities.includes(amenity)) {
      setData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenity],
      }));
    }
    setAmenityInput("");
    setShowAmenitySuggestions(false);
  };

  const handleRemoveAmenity = (index) => {
    const updated = [...data.amenities];
    updated.splice(index, 1);
    setData((prev) => ({ ...prev, amenities: updated }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (amenityRef.current && !amenityRef.current.contains(event.target)) {
        setShowAmenitySuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const img = await uploadImage(file);
      if (img?.url) {
        setData((prev) => ({
          ...prev,
          projectImages: [
            ...prev.projectImages,
            { url: img.url, public_id: img.public_id },
          ],
        }));
        toast.success("Image uploaded");
      } else {
        toast.error("Image upload failed!");
      }
    } catch {
      toast.error("Upload error!");
    }
  };

  const handleImageDelete = async (index, public_id) => {
    try {
      await axios.post(`${base_url}/api/delete-image`, { public_id });
      const filtered = [...data.projectImages];
      filtered.splice(index, 1);
      setData((prev) => ({ ...prev, projectImages: filtered }));
      toast.success("Image deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${base_url}/api/project/add_project`,
        {
          ...data,
          farmHouseDetails: farmHouse,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/dashboard/allProjects");
      } else {
        toast.error(response.data.message);
      }
    } catch {
      toast.error("Failed to submit project");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Upload New Project
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "projectName", placeholder: "Project Name" },
              { name: "projectAddress", placeholder: "Project Address" },
              { name: "landArea", placeholder: "Land Area" },
              { name: "builtUpArea", placeholder: "Built-up Area" },
              { name: "targetIRR", placeholder: "Target IRR" },
              { name: "peRatio", placeholder: "PE Ratio" },
              { name: "targetRentalYield", placeholder: "Target Rental Yield" },
              {
                name: "projectAmount",
                placeholder: "Project Amount",
                type: "number",
              },
              {
                name: "bookingAmount",
                placeholder: "Booking Amount",
                type: "number",
              },
            ].map(({ name, placeholder, type = "text" }) => (
              <div key={name} className="flex flex-col">
                <input
                  name={name}
                  placeholder={placeholder}
                  type={type}
                  className="input-style w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleOnChange}
                />
              </div>
            ))}

            <div className="flex flex-col">
              <select
                name="possessionStatus"
                className="input-style w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleOnChange}
              >
                <option value="">-- Select Possession Status --</option>
                <option value="Ready to move">Ready to move</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Possession Soon">Possession Soon</option>
                <option value="Launching Soon">Launching Soon</option>
              </select>
            </div>

            <div className="flex flex-col">
              <select
                name="interiorStatus"
                className="input-style w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleOnChange}
              >
                <option value="">-- Select Interior Status --</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully-Furnished">Fully-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            <div className="flex flex-col">
              <select
                name="projectStatus"
                className="input-style w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleOnChange}
                value={data.projectStatus}
              >
                <option value="">-- Select Project Status --</option>
                <option value="Newly Launched">Newly Launched</option>
                <option value="Sold Out">Sold Out</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
            </div>

            <div className="flex flex-col">
              <select
                name="projectType"
                className="input-style w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleOnChange}
                value={data.projectType}
              >
                <option value="">-- Select Project Type --</option>
                <option value="Villas">Villas</option>
                <option value="Studio Apartments">Studio Apartments</option>
                <option value="Farm Lands">Farm Lands</option>
                <option value="Farm Houses">Farm Houses</option>
              </select>
            </div>

            <div className="flex flex-col sm:col-span-2">
              <input
                name="functionality"
                placeholder="Functionality (comma separated)"
                className="input-style w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    functionality: e.target.value.split(","),
                  }))
                }
              />
            </div>

            {/* Amenities Input with Suggestions */}
            <div className="col-span-full">
              <div className="relative" ref={amenityRef}>
                <input
                  name="amenities"
                  placeholder="Select or type amenities"
                  className="input-style w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={amenityInput}
                  onFocus={() => setShowAmenitySuggestions(true)}
                  onClick={() => setShowAmenitySuggestions(true)}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const trimmed = amenityInput.trim();
                      if (trimmed && !data.amenities.includes(trimmed)) {
                        setData((prev) => ({
                          ...prev,
                          amenities: [...prev.amenities, trimmed],
                        }));
                      }
                      setAmenityInput("");
                      setShowAmenitySuggestions(false);
                    }
                  }}
                />
                {showAmenitySuggestions && (
                  <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-md w-full mt-1 max-h-40 overflow-y-auto">
                    {commonAmenities
                      .filter((item) =>
                        item.toLowerCase().includes(amenityInput.toLowerCase())
                      )
                      .map((amenity) => (
                        <div
                          key={amenity}
                          onClick={() => handleAddAmenity(amenity)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                        >
                          {amenity}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {data.amenities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 mb-2">
                  {data.amenities.map((item, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <MdClose size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-full">
              <textarea
                name="projectOverview"
                placeholder="Write a detailed project overview here..."
                rows={5}
                value={data.projectOverview}
                onChange={handleOnChange}
                className="input-style w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Ownership Plan */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Ownership Plan Installments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(data.ownershipPlan).map((key) => {
              const placeholder = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());

              return (
                <div key={key} className="flex flex-col">
                  <input
                    type="number"
                    placeholder={placeholder}
                    value={data.ownershipPlan[key]}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        ownershipPlan: {
                          ...prev.ownershipPlan,
                          [key]: e.target.value,
                        },
                      }))
                    }
                    className="input-style w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Unit Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["wholeUnit", "singleUnit"].map((unitKey) => (
            <div key={unitKey} className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 capitalize">
                {unitKey.replace("Unit", " Unit Breakdown")}
              </h3>
              <div className="grid gap-3">
                {Object.keys(data.unitBreakdown[unitKey]).map((field) => {
                  const placeholder = field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase());

                  return (
                    <div key={field} className="flex flex-col">
                      <input
                        placeholder={placeholder}
                        type="number"
                        value={data.unitBreakdown[unitKey][field]}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            unitBreakdown: {
                              ...prev.unitBreakdown,
                              [unitKey]: {
                                ...prev.unitBreakdown[unitKey],
                                [field]: e.target.value,
                              },
                            },
                          }))
                        }
                        className="input-style w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Farm House Costing Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Farm House & Farm Lands Costing 
          </h3>
          {["bsp", "idc", "servicesAndAmenities"].map((key) => (
            <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col">
                <input
                  type="number"
                  placeholder={`${key.toUpperCase()} Square Feet`}
                  value={farmHouse[key].squareFeet}
                  onChange={(e) =>
                    setFarmHouse((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], squareFeet: e.target.value },
                    }))
                  }
                  className="input-style w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col">
                <input
                  type="number"
                  placeholder={`${key.toUpperCase()} Rate`}
                  value={farmHouse[key].rate}
                  onChange={(e) =>
                    setFarmHouse((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], rate: e.target.value },
                    }))
                  }
                  className="input-style w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col">
                <input
                  type="number"
                  placeholder="Total"
                  value={farmHouse[key].total}
                  disabled
                  className="input-style w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>
            </div> 
          ))}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex flex-col">
              <select
                value={farmHouse.farmHouseModule}
                onChange={(e) => setFarmHouse(prev => ({...prev, farmHouseModule: e.target.value}))}
                className="input-style w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Farm House Module</option>
                <option value="Module1">Module 1 (₹500,000)</option>
                <option value="Module2">Module 2 (₹800,000)</option>
              </select>
            </div>
            <div className="flex flex-col">
              <input
                type="number"
                placeholder="Grand Total"
                value={farmHouse.grandTotal}
                disabled
                className="input-style w-full p-3 bg-gray-100 border border-gray-300 rounded-lg font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Upload Project Images
          </h3>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FaCloudUploadAlt className="w-8 h-8 mb-3 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">Click to upload or drag and drop</p>
            </div>
            <input type="file" className="hidden" onChange={handleImageUpload} />
          </label>
          <div className="flex flex-wrap gap-3 mt-4">
            {data.projectImages.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img.url}
                  alt="project"
                  className="w-24 h-24 object-cover border rounded-lg shadow-sm cursor-pointer transition-transform duration-200 hover:scale-105"
                  onClick={() => {
                    setOpenFullScreenImage(true);
                    setFullScreenImage(img.url);
                  }}
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                  onClick={() => handleImageDelete(i, img.public_id)}
                >
                  <MdDelete size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <label className="block mb-2 font-medium text-gray-700">
            Project Description:
          </label>
          <JoditEditor
            ref={editor}
            value={data.description}
            config={{
              height: 300,
              readonly: false,
              toolbarAdaptive: false,
              buttons: "bold,italic,underline,ul,ol,align,link,source",
            }}
            onBlur={(content) =>
              setData((prev) => ({ ...prev, description: content }))
            }
            onChange={() => {}}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center md:justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto font-medium shadow-md hover:shadow-lg"
          >
            Submit Project
          </button>
        </div>
      </form>

      {/* Fullscreen Image View */}
      {openFullScreenImage && (
        <DisplayImage
          imgUrl={fullScreenImage}
          onClose={() => setOpenFullScreenImage(false)}
        />
      )}
      
      <style jsx>{`
        .input-style:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
};

export default AddProject;