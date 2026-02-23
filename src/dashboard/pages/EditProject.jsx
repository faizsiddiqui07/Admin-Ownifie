import React, { useEffect, useRef, useState, useMemo } from "react";
import { MdClose, MdDelete } from "react-icons/md";
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from "../helpers/uploadImage";
import DisplayImage from "../components/DisplayImage";
import axios from "axios";
import { base_url } from "../../config/config";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import JoditEditor from "jodit-react";

// Import Shadcn components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EditProject = () => {
  const navigate = useNavigate();
  const { project_id } = useParams();

  const editor = useRef(null);
  const amenityRef = useRef();
  const tabsRef = useRef(null);

  // Naya Ref Description ke liye taaki Jodit crash na ho
  const descriptionRef = useRef("");

  const [activeTab, setActiveTab] = useState("basic");
  const [showAmenitySuggestions, setShowAmenitySuggestions] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState();
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [amenityInput, setAmenityInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const bspTotal = calc(farmHouse.bsp?.squareFeet, farmHouse.bsp?.rate);
    const idcTotal = calc(farmHouse.idc?.squareFeet, farmHouse.idc?.rate);
    const amenityTotal = calc(
      farmHouse.servicesAndAmenities?.squareFeet,
      farmHouse.servicesAndAmenities?.rate,
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
    farmHouse.bsp?.squareFeet,
    farmHouse.bsp?.rate,
    farmHouse.idc?.squareFeet,
    farmHouse.idc?.rate,
    farmHouse.servicesAndAmenities?.squareFeet,
    farmHouse.servicesAndAmenities?.rate,
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

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${base_url}/api/project/${project_id}`);
        if (res.data.success) {
          setData(res.data.data);

          // Fetched description ko bhi Ref mein store karein
          descriptionRef.current = res.data.data.description || "";

          setFarmHouse((prev) => ({
            ...prev,
            ...res.data.data.farmHouseDetails,
            bsp: {
              squareFeet: res.data.data.farmHouseDetails?.bsp?.squareFeet || "",
              rate: res.data.data.farmHouseDetails?.bsp?.rate || "",
              total: res.data.data.farmHouseDetails?.bsp?.total || 0,
            },
            idc: {
              squareFeet: res.data.data.farmHouseDetails?.idc?.squareFeet || "",
              rate: res.data.data.farmHouseDetails?.idc?.rate || "",
              total: res.data.data.farmHouseDetails?.idc?.total || 0,
            },
            servicesAndAmenities: {
              squareFeet:
                res.data.data.farmHouseDetails?.servicesAndAmenities
                  ?.squareFeet || "",
              rate:
                res.data.data.farmHouseDetails?.servicesAndAmenities?.rate ||
                "",
              total:
                res.data.data.farmHouseDetails?.servicesAndAmenities?.total ||
                0,
            },
            farmHouseModule:
              res.data.data.farmHouseDetails?.farmHouseModule || "",
            modulePrice: res.data.data.farmHouseDetails?.modulePrice || 0,
            grandTotal: res.data.data.farmHouseDetails?.grandTotal || 0,
          }));
        } else {
          toast.error("Failed to fetch project details");
        }
      } catch (error) {
        toast.error("Error fetching project details");
        console.error(error);
      }
    };

    fetchProject();
  }, [project_id]);

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

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      return toast.error("Please select a valid image (JPEG, PNG, WEBP, GIF)");
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return toast.error("Image size must be less than 5MB");
    }

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
        toast.success("Image uploaded successfully");
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
    setIsSubmitting(true);
    try {
      // Yahan description Ref se le rahe hain update karte waqt bhi
      const payload = {
        ...data,
        description: descriptionRef.current,
        farmHouseDetails: farmHouse,
      };

      const response = await axios.put(
        `${base_url}/api/update/${project_id}`,
        payload,
      );

      if (response.data.success) {
        toast.success("Project updated successfully");
        navigate("/dashboard/allProjects");
      } else {
        toast.error(response.data.message || "Failed to update project");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || "Submission error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "ownership", label: "Ownership Plan" },
    { id: "units", label: "Unit Breakdown" },
    { id: "farmhouse", label: "Farm House Costing" },
    { id: "images", label: "Project Images" },
    { id: "description", label: "Description" },
  ];

  const joditConfig = useMemo(
    () => ({
      height: 300,
      readonly: false,
      toolbarAdaptive: false,
      style: {
        font: "14px sans-serif",
      },
    }),
    [],
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Edit Project
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Update the details of your existing project listing
          </p>
        </div>

        <div className="block xl:hidden">
          <div className="flex gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => {
                const currentIndex = tabs.findIndex(
                  (tab) => tab.id === activeTab,
                );
                if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
              }}
              disabled={activeTab === "basic"}
              className="px-4 py-2 md:px-5 md:py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => {
                const currentIndex = tabs.findIndex(
                  (tab) => tab.id === activeTab,
                );
                if (currentIndex < tabs.length - 1)
                  setActiveTab(tabs[currentIndex + 1].id);
              }}
              disabled={activeTab === "description"}
              className="px-4 py-2 md:px-5 md:py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
            >
              Next
            </button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mb-6 md:mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-1 w-[100%] hidden xl:block">
            <TabsList className="w-full">
              <div className="w-full flex min-w-max space-x-4 sm:space-x-6 snap-x snap-mandatory">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="px-3 py-2 overflow-x-auto text-xs sm:text-sm font-medium rounded-lg transition-colors 
                        data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 
                        data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 
                        data-[state=inactive]:hover:bg-gray-100 whitespace-nowrap"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 mt-6">
            <TabsContent value="basic">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-md overflow-hidden">
                <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Basic Information
                  </h3>
                </div>
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {[
                    {
                      name: "projectName",
                      placeholder: "Project Name",
                      required: true,
                    },
                    {
                      name: "projectAddress",
                      placeholder: "Project Address",
                      required: true,
                    },
                    { name: "landArea", placeholder: "Land Area (sq ft)" },
                    {
                      name: "builtUpArea",
                      placeholder: "Built-up Area (sq ft)",
                    },
                    { name: "targetIRR", placeholder: "Target IRR (%)" },
                    { name: "peRatio", placeholder: "PE Ratio" },
                    {
                      name: "targetRentalYield",
                      placeholder: "Target Rental Yield (%)",
                    },
                    {
                      name: "projectAmount",
                      placeholder: "Project Amount (₹)",
                      type: "number",
                    },
                    {
                      name: "bookingAmount",
                      placeholder: "Booking Amount (₹)",
                      type: "number",
                    },
                  ].map(
                    ({
                      name,
                      placeholder,
                      type = "text",
                      required = false,
                    }) => (
                      <div key={name} className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          {placeholder}{" "}
                          {required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          name={name}
                          type={type}
                          value={data[name] || ""}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          onChange={handleOnChange}
                          placeholder={placeholder}
                          required={required}
                        />
                      </div>
                    ),
                  )}

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Possession Status
                    </label>
                    <select
                      name="possessionStatus"
                      value={data.possessionStatus || ""}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      onChange={handleOnChange}
                    >
                      <option value="">Select Possession Status</option>
                      <option value="Ready to move">Ready to move</option>
                      <option value="Under Construction">
                        Under Construction
                      </option>
                      <option value="Possession Soon">Possession Soon</option>
                      <option value="Launching Soon">Launching Soon</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Interior Status
                    </label>
                    <select
                      name="interiorStatus"
                      value={data.interiorStatus || ""}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      onChange={handleOnChange}
                    >
                      <option value="">Select Interior Status</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Fully-Furnished">Fully-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Project Status
                    </label>
                    <select
                      name="projectStatus"
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      onChange={handleOnChange}
                      value={data.projectStatus}
                    >
                      <option value="">Select Project Status</option>
                      <option value="Newly Launched">Newly Launched</option>
                      <option value="Sold Out">Sold Out</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Project Type
                    </label>
                    <select
                      name="projectType"
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      onChange={handleOnChange}
                      value={data.projectType}
                    >
                      <option value="">Select Project Type</option>
                      <option value="Villas">Villas</option>
                      <option value="Studio Apartments">
                        Studio Apartments
                      </option>
                      <option value="Farm Lands">Farm Lands</option>
                      <option value="Farm Houses">Farm Houses</option>
                      <option value="Private Nature Residence">
                        Private Nature Residence
                      </option>
                    </select>
                  </div>

                  <div className="flex flex-col md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Functionality
                    </label>
                    <input
                      name="functionality"
                      value={data.functionality || ""}
                      placeholder="Enter functionalities separated by commas"
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          functionality: e.target.value.split(","),
                        }))
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Amenities
                    </label>
                    <div className="relative" ref={amenityRef}>
                      <input
                        placeholder="Type to search or select amenities"
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                        <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-full mt-1 max-h-48 overflow-y-auto">
                          {commonAmenities
                            .filter((item) =>
                              item
                                .toLowerCase()
                                .includes(amenityInput.toLowerCase()),
                            )
                            .map((amenity) => (
                              <div
                                key={amenity}
                                onClick={() => handleAddAmenity(amenity)}
                                className="px-3 py-2 md:px-4 md:py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                {amenity}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {data.amenities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {data.amenities.map((item, index) => (
                          <div
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm flex items-center gap-1 transition-colors hover:bg-blue-200"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => handleRemoveAmenity(index)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <MdClose size={14} className="md:w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Project Overview
                    </label>
                    <textarea
                      name="projectOverview"
                      placeholder="Provide a detailed overview of the project..."
                      rows={4}
                      value={data.projectOverview}
                      onChange={handleOnChange}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    ></textarea>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ownership">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-md overflow-hidden">
                <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Ownership Plan
                  </h3>
                </div>
                <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {Object.keys(data.ownershipPlan).map((key, index) => {
                    const placeholder = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                    return (
                      <div key={key} className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          {placeholder}{" "}
                          {index === 0 && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 md:top-3 text-gray-500">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="Amount"
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
                            className="w-full pl-8 pr-3 md:pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required={index === 0}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="units">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {["wholeUnit", "singleUnit"].map((unitKey) => (
                  <div
                    key={unitKey}
                    className="bg-white rounded-xl md:rounded-2xl shadow-md overflow-hidden"
                  >
                    <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 capitalize">
                        {unitKey.replace("Unit", " Unit")} Breakdown
                      </h3>
                    </div>
                    <div className="p-4 md:p-6 grid gap-3 md:gap-4">
                      {Object.keys(data.unitBreakdown[unitKey]).map((field) => {
                        const placeholder = field
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase());
                        return (
                          <div key={field} className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">
                              {placeholder}
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 md:top-3 text-gray-500">
                                ₹
                              </span>
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
                                className="w-full pl-8 pr-3 md:pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="farmhouse">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-md overflow-hidden">
                <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Farm House Costing
                    </h3>
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  {["bsp", "idc", "servicesAndAmenities"].map((key) => (
                    <div
                      key={key}
                      className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          {key.toUpperCase()} Square Feet
                        </label>
                        <input
                          type="number"
                          placeholder="Square Feet"
                          value={farmHouse[key]?.squareFeet || ""}
                          onChange={(e) =>
                            setFarmHouse((prev) => ({
                              ...prev,
                              [key]: {
                                ...prev[key],
                                squareFeet: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          {key.toUpperCase()} Rate (₹/sq ft)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 md:top-3 text-gray-500">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="Rate"
                            value={farmHouse[key]?.rate || ""}
                            onChange={(e) =>
                              setFarmHouse((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], rate: e.target.value },
                              }))
                            }
                            className="w-full pl-8 pr-3 md:pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 md:top-3 text-gray-500">
                            ₹
                          </span>
                          <input
                            type="text"
                            value={formatCurrency(farmHouse[key]?.total || 0)}
                            disabled
                            className="w-full pl-8 pr-3 md:pr-4 py-2 md:py-3 bg-gray-100 border border-gray-300 rounded-lg font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Farm House Module
                      </label>
                      <select
                        value={farmHouse.farmHouseModule}
                        onChange={(e) =>
                          setFarmHouse((prev) => ({
                            ...prev,
                            farmHouseModule: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Farm House Module</option>
                        <option value="Module1">Module 1 (₹500,000)</option>
                        <option value="Module2">Module 2 (₹800,000)</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Grand Total
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 md:top-3 text-gray-500">
                          ₹
                        </span>
                        <input
                          type="text"
                          value={formatCurrency(farmHouse.grandTotal || 0)}
                          disabled
                          className="w-full pl-8 pr-3 md:pr-4 py-2 md:py-3 bg-blue-50 border border-blue-200 rounded-lg font-semibold text-blue-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="images">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-md overflow-hidden">
                <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Project Images
                  </h3>
                </div>
                <div className="p-4 md:p-6">
                  <label className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-dashed border-gray-300 rounded-lg md:rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaCloudUploadAlt className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3 text-gray-400" />
                      <p className="mb-1 md:mb-2 text-xs md:text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageUpload}
                      multiple
                    />
                  </label>

                  {data.projectImages.length > 0 && (
                    <div className="mt-4 md:mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">
                        Uploaded Images ({data.projectImages.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                        {data.projectImages.map((img, i) => (
                          <div key={i} className="relative group">
                            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                              <img
                                src={img.url}
                                alt="project"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <button
                              type="button"
                              className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                              onClick={() =>
                                handleImageDelete(i, img.public_id)
                              }
                            >
                              <MdDelete size={14} className="md:w-4" />
                            </button>
                            <div
                              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              onClick={() => {
                                setOpenFullScreenImage(true);
                                setFullScreenImage(img.url);
                              }}
                            >
                              <span className="text-white text-xs md:text-sm font-medium">
                                View
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="description">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-md overflow-hidden">
                <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Project Description
                  </h3>
                </div>
                <div className="p-4 md:p-6">
                  <JoditEditor
                    ref={editor}
                    value={data.description}
                    config={joditConfig}
                    onChange={(newContent) => {
                      // Yahan state ki jagah ref me save kar rahe hain taaki re-render na ho
                      descriptionRef.current = newContent;
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <div className="flex flex-col sm:flex-row justify-between gap-3 bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-md">
              <div className="flex gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(
                      (tab) => tab.id === activeTab,
                    );
                    if (currentIndex > 0)
                      setActiveTab(tabs[currentIndex - 1].id);
                  }}
                  disabled={activeTab === "basic"}
                  className="px-4 py-2 md:px-5 md:py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(
                      (tab) => tab.id === activeTab,
                    );
                    if (currentIndex < tabs.length - 1)
                      setActiveTab(tabs[currentIndex + 1].id);
                  }}
                  disabled={activeTab === "description"}
                  className="px-4 py-2 md:px-5 md:py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                >
                  Next
                </button>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 md:px-8 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center text-sm md:text-base mt-3 sm:mt-0"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Project"
                )}
              </button>
            </div>
          </form>
        </Tabs>

        {openFullScreenImage && (
          <DisplayImage
            imgUrl={fullScreenImage}
            onClose={() => setOpenFullScreenImage(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EditProject;
