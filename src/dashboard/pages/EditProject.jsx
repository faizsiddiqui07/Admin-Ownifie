import React, { useEffect, useRef, useState } from "react";
import { MdClose, MdDelete } from "react-icons/md";
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from "../helpers/uploadImage";
import DisplayImage from "../components/DisplayImage";
import axios from "axios";
import { base_url } from "../../config/config";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import JoditEditor from "jodit-react";

const EditProject = () => {
  const navigate = useNavigate();
  const { project_id } = useParams();

  const editor = useRef(null);
  const [fullScreenImage, setFullScreenImage] = useState();
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const amenityRef = useRef();
  const [showAmenitySuggestions, setShowAmenitySuggestions] = useState(false);
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

    const bspTotal = calc(farmHouse.bsp?.squareFeet, farmHouse.bsp?.rate);
    const idcTotal = calc(farmHouse.idc?.squareFeet, farmHouse.idc?.rate);
    const amenityTotal = calc(
      farmHouse.servicesAndAmenities?.squareFeet,
      farmHouse.servicesAndAmenities?.rate
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

  const handleAddAmenity = (amenity) => {
    if (!data.amenities.includes(amenity)) {
      setData((prev) => ({ ...prev, amenities: [...prev.amenities, amenity] }));
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
    try {
      const img = await uploadImage(file);
      if (img?.url) {
        setData((prev) => ({
          ...prev,
          projectImages: [...prev.projectImages, img],
        }));
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Upload error");
    }
  };

  const handleImageDelete = async (index, public_id) => {
    try {
      await axios.post(`${base_url}/api/delete-image`, { public_id });
      const updated = [...data.projectImages];
      updated.splice(index, 1);
      setData((prev) => ({ ...prev, projectImages: updated }));
      toast.success("Image deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...data,
        farmHouseDetails: farmHouse,
      };
      const res = await axios.put(`${base_url}/api/update/${project_id}`,
        payload,
        // {
        //   withCredentials: true,
        // }
      );
      if (res.data.success) {
        toast.success("Project updated");
        navigate("/dashboard/allProjects");
      } else {
        toast.error("Failed to update project");
      }
    } catch {
      toast.error("Submission error");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Edit Project
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2  gap-4">
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
              <input
                key={name}
                name={name}
                placeholder={placeholder}
                type={type}
                value={data[name] || ""}
                className="input-style w-full"
                onChange={handleOnChange}
              />
            ))}

            <select
              name="possessionStatus"
              className="input-style w-full"
              onChange={handleOnChange}
              value={data.possessionStatus}
            >
              <option value="">-- Select Possession Status --</option>
              <option value="Ready to move">Ready to move</option>
              <option value="Under Construction">Under Construction</option>
              <option value="Possession Soon">Possession Soon</option>
              <option value="Launching Soon">Launching Soon</option>
            </select>

            <select
              name="interiorStatus"
              className="input-style w-full"
              onChange={handleOnChange}
              value={data.interiorStatus}
            >
              <option value="">-- Select Interior Status --</option>
              <option value="Semi-Furnished">Semi-Furnished</option>
              <option value="Fully-Furnished">Fully-Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>

            <select
              name="projectStatus"
              className="input-style w-full"
              onChange={handleOnChange}
              value={data.projectStatus}
            >
              <option value="">-- Select Project Status --</option>
              <option value="Newly Launched">Newly Launched</option>
              <option value="Sold Out">Sold Out</option>
              <option value="Coming Soon">Coming Soon</option>
            </select>

            <select
              name="projectType"
              className="input-style w-full"
              onChange={handleOnChange}
              value={data.projectType}
            >
              <option value="">-- Select Project Type --</option>
              <option value="Villas">Villas</option>
              <option value="Studio Apartments">Studio Apartments</option>
              <option value="Farm Lands">Farm Lands</option>
              <option value="Farm Houses">Farm Houses</option>
            </select>

            <div className="">
              <input
                name="functionality"
                placeholder="Functionality (comma separated)"
                className="input-style w-full col-span-full sm:col-span-2 lg:col-span-1"
                value={data.functionality}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    functionality: e.target.value.split(","),
                  }))
                }
              />
            </div>

            <div className="col-span-full">
              <div className="relative" ref={amenityRef}>
                <input
                  name="amenities"
                  placeholder="Select or type amenities"
                  className="input-style w-full"
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

                {/* Suggestions dropdown */}
                {showAmenitySuggestions && (
                  <div className="absolute z-10 bg-white border rounded shadow-md w-full mt-1 max-h-40 overflow-y-auto">
                    {commonAmenities
                      .filter((item) =>
                        item.toLowerCase().includes(amenityInput.toLowerCase())
                      )
                      .map((amenity) => (
                        <div
                          key={amenity}
                          onClick={() => handleAddAmenity(amenity)}
                          className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                        >
                          {amenity}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Amenities tag list: OUTSIDE the input row */}
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
                className="input-style w-full"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Ownership Plan */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Ownership Plan Installments
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.keys(data.ownershipPlan).map((key) => {
              const placeholder = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());

              return (
                <input
                  key={key}
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
                  className="input-style"
                />
              );
            })}
          </div>
        </div>

        {/* Unit Breakdown */}
        <div className="grid md:grid-cols-2 gap-4">
          {["wholeUnit", "singleUnit"].map((unitKey) => (
            <div key={unitKey} className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-700 capitalize">
                {unitKey.replace("Unit", " Unit Breakdown")}
              </h3>
              <div className="grid gap-3">
                {Object.keys(data.unitBreakdown[unitKey]).map((field) => {
                  const placeholder = field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase());

                  return (
                    <input
                      key={field}
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
                      className="input-style"
                    />
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
            <div key={key} className="grid sm:grid-cols-3 gap-4 mb-4">
              <input
                type="number"
                placeholder={`${key.toUpperCase()} Square Feet`}
                value={farmHouse[key]?.squareFeet}
                onChange={(e) =>
                  setFarmHouse((prev) => ({
                    ...prev,
                    [key]: { ...prev[key], squareFeet: e.target.value },
                  }))
                }
                className="input-style"
              />
              <input
                type="number"
                placeholder={`${key.toUpperCase()} Rate`}
                value={farmHouse[key]?.rate}
                onChange={(e) =>
                  setFarmHouse((prev) => ({
                    ...prev,
                    [key]: { ...prev[key], rate: e.target.value },
                  }))
                }
                className="input-style"
              />
              <input
                type="number"
                placeholder="Total"
                value={farmHouse[key]?.total}
                disabled
                className="input-style bg-gray-100"
              />
            </div>
          ))}
        </div>

        {/* Image Upload */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">
            Upload Project Images
          </h3>
          <input type="file" onChange={handleImageUpload} />
          <div className="flex flex-wrap gap-3 mt-4">
            {data.projectImages.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img.url}
                  alt="project"
                  className="w-24 h-24 object-cover border rounded shadow-md cursor-pointer"
                  onClick={() => {
                    setOpenFullScreenImage(true);
                    setFullScreenImage(img.url);
                  }}
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
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
              height: 300, // height in pixels (e.g., 400px)
              readonly: false,
            }}
            onBlur={(content) =>
              setData((prev) => ({ ...prev, description: content }))
            }
            onChange={() => {}}
          />
        </div>
        {/* Submit Button */}
        <div className="text-right">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
          >
            Update Project
          </button>
        </div>
      </form>

      {openFullScreenImage && (
        <DisplayImage
          imgUrl={fullScreenImage}
          onClose={() => setOpenFullScreenImage(false)}
        />
      )}
    </div>
  );
};

export default EditProject;
