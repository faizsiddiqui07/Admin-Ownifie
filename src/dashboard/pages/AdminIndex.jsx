import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuUserCheck } from "react-icons/lu";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaChartBar,
  FaHome,
  FaBuilding,
  FaTree,
  FaCity,
  FaBlog,
  FaArrowRight,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaCalendar,
  FaUser,
  FaExternalLinkAlt,
  FaEllipsisV,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSync,
  FaCog,
  FaDownload,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { base_url } from "../../config/config";
import storeContext from "../../context/storeContext";
import axios from "axios";
import { debounce } from "lodash";

const AdminIndex = () => {
  const { store } = useContext(storeContext);
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    farmHouseCount: 0,
    farmLandCount: 0,
    studioApartmentCount: 0,
    villaCount: 0,
    totalBlogs: 0,
    activeBlogs: 0,
    inactiveBlogs: 0,
  });
  const [activeUsers, setActiveUsers] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const navigate = useNavigate();

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  // Fetch projects and blogs with error handling
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch projects
      const projectsResponse = await axios.get(`${base_url}/api/allProjects`);
      const projectsData = projectsResponse.data.data || [];
      setProjects(projectsData);

      // Fetch blogs
      const blogsResponse = await axios.get(`${base_url}/api/allBlog`);
      const blogsData = blogsResponse.data.success
        ? blogsResponse.data.data
        : [];
      setBlogs(blogsData);

      // Calculate stats
      const activeBlogs = blogsData.filter(
        (blog) => blog.status === "active"
      ).length;

      setStats({
        totalProjects: projectsData.length,
        farmHouseCount: projectsData.filter((p) => p.type === "farmhouse")
          .length,
        farmLandCount: projectsData.filter((p) => p.type === "farmland").length,
        studioApartmentCount: projectsData.filter((p) => p.type === "apartment")
          .length,
        villaCount: projectsData.filter((p) => p.type === "villa").length,
        totalBlogs: blogsData.length,
        activeBlogs,
        inactiveBlogs: blogsData.length - activeBlogs,
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("Failed to fetch data. Please try again.", "error");
      setIsLoading(false);
    }
  }, []);

const fetchActiveUsers = useCallback(async () => {
  try {
    const { data } = await axios.get(`${base_url}/active-users`);
    setActiveUsers(data.activeUsers);
  } catch (error) {
    console.error("Failed to fetch active users:", error);
  }
}, []);

useEffect(() => {
    fetchData();
    fetchActiveUsers()
  }, [fetchData,fetchActiveUsers]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((term) => setSearchTerm(term), 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle search input change
  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Sort data
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // Request sort
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 opacity-50" />;
    if (sortConfig.direction === "ascending")
      return <FaSortUp className="ml-1" />;
    return <FaSortDown className="ml-1" />;
  };

  // Filter data based on active tab and filters
  useEffect(() => {
    let results = activeTab === "projects" ? [...projects] : [...blogs];

    // Apply search filter
    if (searchTerm) {
      if (activeTab === "projects") {
        results = results.filter(
          (item) =>
            item.projectName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (item.projectAddress &&
              item.projectAddress
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
        );
      } else {
        results = results.filter(
          (item) =>
            item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.content &&
              item.content.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (activeTab === "projects") {
        results = results.filter((item) => item.status === statusFilter);
      } else {
        results = results.filter((item) => item.status === statusFilter);
      }
    }

    // Apply type filter (only for projects)
    if (activeTab === "projects" && typeFilter !== "all") {
      results = results.filter((item) => item.type === typeFilter);
    }

    setFilteredData(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, typeFilter, projects, blogs, activeTab]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Select/deselect all items
  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map((item) => item._id));
    }
  };

  // Toggle selection for a single item
  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Apply bulk action
  const applyBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;

    try {
      if (bulkAction === "delete") {
        if (
          window.confirm(
            `Are you sure you want to delete ${selectedItems.length} items?`
          )
        ) {
          for (const id of selectedItems) {
            if (activeTab === "projects") {
              await axios.delete(`${base_url}/api/project/${id}`);
            } else {
              await axios.delete(`${base_url}/api/blogDelete/${id}`);
            }
          }
          showNotification(
            `${selectedItems.length} items deleted successfully`
          );
          setSelectedItems([]);
          setBulkAction("");
          fetchData();
        }
      } else if (bulkAction === "activate" || bulkAction === "deactivate") {
        const status = bulkAction === "activate" ? "active" : "deactive";
        for (const id of selectedItems) {
          if (activeTab === "projects") {
            await axios.put(`${base_url}/api/project/status-update/${id}`, {
              status,
            });
          } else {
            await axios.put(`${base_url}/api/blog/status-update/${id}`, {
              status,
            });
          }
        }
        showNotification(`${selectedItems.length} items updated successfully`);
        setSelectedItems([]);
        setBulkAction("");
        fetchData();
      }
    } catch (error) {
      console.error("Error applying bulk action:", error);
      showNotification(
        "Failed to apply bulk action. Please try again.",
        "error"
      );
    }
  };

  const deleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`${base_url}/api/project/${id}`);
        showNotification("Project deleted successfully");
        fetchData();
      } catch (error) {
        console.log(error);
        showNotification(
          "Failed to delete project. Please try again.",
          "error"
        );
      }
    }
  };

  const deleteBlog = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await axios.delete(`${base_url}/api/blogDelete/${id}`);
        showNotification("Blog deleted successfully");
        fetchData();
      } catch (error) {
        console.log(error);
        showNotification("Failed to delete blog. Please try again.", "error");
      }
    }
  };

  const toggleStatus = async (id, currentStatus, type) => {
    const newStatus = currentStatus === "active" ? "deactive" : "active";

    try {
      if (type === "project") {
        await axios.put(`${base_url}/api/project/status-update/${id}`, {
          status: newStatus,
        });
      } else {
        await axios.put(`${base_url}/api/blog/status-update/${id}`, {
          status: newStatus,
        });
      }
      showNotification(`Status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      console.log(error);
      showNotification("Failed to update status. Please try again.", "error");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Export data
  const exportData = () => {
    const dataToExport = sortedData.map((item) => {
      if (activeTab === "projects") {
        return {
          Name: item.projectName,
          Address: item.projectAddress,
          Type: item.type,
          Status: item.status,
          Date: formatDate(item.date),
        };
      } else {
        return {
          Title: item.title,
          Author: item.author,
          Status: item.status,
          Date: formatDate(item.date),
        };
      }
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        Object.keys(dataToExport[0]).join(","),
        ...dataToExport.map((item) => Object.values(item).join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-opacity duration-300 ${
            notification.type === "error"
              ? "bg-red-100 text-red-800 border-l-4 border-red-500"
              : "bg-green-100 text-green-800 border-l-4 border-green-500"
          }`}
        >
          <div className="flex items-center">
            <span>{notification.message}</span>
            <button
              onClick={() =>
                setNotification({ show: false, message: "", type: "" })
              }
              className="ml-4"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Manage your projects and blogs from one place
          </p>
        </div>
        <div className="flex flex-wrap gap-1 xs:gap-2">
          <button
            onClick={fetchData}
            className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <FaSync className="text-sm" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={exportData}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            title="Export Data"
          >
            <FaDownload className="text-sm" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <Link
            to="/dashboard/project/add"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-2 sm:px-4 rounded-lg transition-colors"
          >
            <FaPlus className="text-sm" />
            <span>Project</span>
          </Link>
          <Link
            to="/dashboard/blog/add"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-2 sm:px-4 rounded-lg transition-colors"
          >
            <FaPlus className="text-sm" />
            <span>Blog</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        <SummaryCard
          title="Total Projects"
          count={stats.totalProjects}
          icon={<FaChartBar />}
          bg="bg-gradient-to-r from-blue-500 to-blue-600"
          onClick={() => setActiveTab("projects")}
        />
        <SummaryCard
          title="Active User"
          count={activeUsers}
          icon={<LuUserCheck />}
          bg="bg-gradient-to-r from-green-500 to-green-600"
        />
        <SummaryCard
          title="Studio Apartments"
          count={stats.studioApartmentCount}
          icon={<FaBuilding />}
          bg="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <SummaryCard
          title="Villas"
          count={stats.villaCount}
          icon={<FaCity />}
          bg="bg-gradient-to-r from-red-500 to-red-600"
        />
        <SummaryCard
          title="Total Blogs"
          count={stats.totalBlogs}
          icon={<FaBlog />}
          bg="bg-gradient-to-r from-indigo-500 to-indigo-600"
          onClick={() => setActiveTab("blogs")}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap border-b">
          <button
            className={`px-4 py-3 font-medium flex items-center gap-2 ${
              activeTab === "projects"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("projects")}
          >
            <FaBuilding />
            <span className="hidden sm:inline">Projects</span> (
            {projects.length})
          </button>
          <button
            className={`px-4 py-3 font-medium flex items-center gap-2 ${
              activeTab === "blogs"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("blogs")}
          >
            <FaBlog />
            <span className="hidden sm:inline">Blogs</span> ({blogs.length})
          </button>
        </div>

        {/* Filters Section */}
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={
                  activeTab === "projects"
                    ? "Search projects..."
                    : "Search blogs..."
                }
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={handleSearchChange}
                defaultValue={searchTerm}
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchTerm("")}
                >
                  <FaTimes className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button
                className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
                <span>Filters</span>
                {showFilters ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              <div
                className={`${
                  showFilters ? "flex" : "hidden"
                } md:flex flex-col sm:flex-row gap-2`}
              >
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="deactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>

                {activeTab === "projects" && (
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="farmhouse">Farm House</option>
                    <option value="farmland">Farm Land</option>
                    <option value="apartment">Studio Apartment</option>
                    <option value="villa">Villa</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="p-4 border-b bg-blue-50 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="font-medium">
              {selectedItems.length} item(s) selected
            </span>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <option value="">Bulk Actions</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={applyBulkAction}
              disabled={!bulkAction}
              className={`px-4 py-2 rounded-lg ${
                bulkAction
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Apply
            </button>
          </div>
        )}

        {/* Content Section */}
        <div className="overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No {activeTab} found</p>
              {searchTerm ||
              statusFilter !== "all" ||
              (activeTab === "projects" && typeFilter !== "all") ? (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 mx-auto"
                >
                  <FaTimes className="text-sm" />
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : activeTab === "projects" ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <ProjectTable
                  projects={paginatedData}
                  deleteProject={deleteProject}
                  toggleStatus={toggleStatus}
                  selectedItems={selectedItems}
                  toggleSelectItem={toggleSelectItem}
                  toggleSelectAll={toggleSelectAll}
                  allSelected={
                    selectedItems.length === paginatedData.length &&
                    paginatedData.length > 0
                  }
                  requestSort={requestSort}
                  getSortIndicator={getSortIndicator}
                />
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden">
                <ProjectCards
                  projects={paginatedData}
                  deleteProject={deleteProject}
                  toggleStatus={toggleStatus}
                  selectedItems={selectedItems}
                  toggleSelectItem={toggleSelectItem}
                />
              </div>
            </>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <BlogTable
                  blogs={paginatedData}
                  deleteBlog={deleteBlog}
                  toggleStatus={toggleStatus}
                  navigate={navigate}
                  selectedItems={selectedItems}
                  toggleSelectItem={toggleSelectItem}
                  toggleSelectAll={toggleSelectAll}
                  allSelected={
                    selectedItems.length === paginatedData.length &&
                    paginatedData.length > 0
                  }
                  requestSort={requestSort}
                  getSortIndicator={getSortIndicator}
                />
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden">
                <BlogCards
                  blogs={paginatedData}
                  deleteBlog={deleteBlog}
                  toggleStatus={toggleStatus}
                  navigate={navigate}
                  selectedItems={selectedItems}
                  toggleSelectItem={toggleSelectItem}
                />
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {sortedData.length > 0 && (
  <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
    
    {/* Entries per page */}
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">Show</span>
      <select
        className="border border-gray-300 rounded-md px-2 py-1"
        value={itemsPerPage}
        onChange={handleItemsPerPageChange}
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
      </select>
      <span className="text-sm text-gray-700">entries</span>
    </div>

    {/* Showing info */}
    <div className="text-sm text-gray-700">
      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
      {Math.min(currentPage * itemsPerPage, sortedData.length)} of{" "}
      {sortedData.length} entries
    </div>

    {/* Pagination simple */}
    <div className="flex gap-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="px-3 py-1">{currentPage} / {totalPages}</span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

// Project Table Component (for desktop)
const ProjectTable = ({
  projects,
  deleteProject,
  toggleStatus,
  selectedItems,
  toggleSelectItem,
  toggleSelectAll,
  allSelected,
  requestSort,
  getSortIndicator,
}) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </th>
          <th
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => requestSort("projectName")}
          >
            <div className="flex items-center">
              Project
              {getSortIndicator("projectName")}
            </div>
          </th>
          <th
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => requestSort("type")}
          >
            <div className="flex items-center">
              Type
              {getSortIndicator("type")}
            </div>
          </th>
          <th
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => requestSort("date")}
          >
            <div className="flex items-center">
              Date
              {getSortIndicator("date")}
            </div>
          </th>
          <th
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => requestSort("status")}
          >
            <div className="flex items-center">
              Status
              {getSortIndicator("status")}
            </div>
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {projects.map((project) => (
          <tr key={project._id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-4">
              <input
                type="checkbox"
                checked={selectedItems.includes(project._id)}
                onChange={() => toggleSelectItem(project._id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td className="px-4 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12">
                  {project.projectImages && project.projectImages[0]?.url ? (
                    <img
                      src={project.projectImages[0].url}
                      alt={project.projectName}
                      className="h-12 w-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {project.projectName}
                  </div>
                  <div className="text-sm text-gray-500 line-clamp-1">
                    {project.projectAddress}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
              {project.projectType || "N/A"}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
              {project.date
                ? new Date(project.date).toLocaleDateString()
                : "N/A"}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              <button
                onClick={() =>
                  toggleStatus(project._id, project.status, "project")
                }
                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${
                  project.status === "active"
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : project.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    : "bg-red-100 text-red-800 hover:bg-red-200"
                }`}
              >
                {project.status || "inactive"}
              </button>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center space-x-2">
                <Link
                  to={`https://ownifie.com/projectdetail/${project.slug}`}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  title="View Project"
                >
                  <FaEye />
                </Link>
                <Link
                  to={`/dashboard/${
                    project.isFurniture ? "furniture" : "project"
                  }/edit/${project._id}`}
                  className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                  title="Edit Project"
                >
                  <FaEdit />
                </Link>
                <button
                  onClick={() => deleteProject(project._id)}
                  className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Project"
                >
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Project Cards Component (for mobile/tablet)
const ProjectCards = ({
  projects,
  deleteProject,
  toggleStatus,
  selectedItems,
  toggleSelectItem,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
    {projects.map((project) => (
      <div
        key={project._id}
        className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedItems.includes(project._id)}
                onChange={() => toggleSelectItem(project._id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
              />
              <div className="flex-shrink-0 h-16 w-16">
                {project.projectImages && project.projectImages[0]?.url ? (
                  <img
                    src={project.projectImages[0].url}
                    alt={project.projectName}
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() =>
                toggleStatus(project._id, project.status, "project")
              }
              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${
                project.status === "active"
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : project.status === "pending"
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  : "bg-red-100 text-red-800 hover:bg-red-200"
              }`}
            >
              {project.status || "inactive"}
            </button>
          </div>

          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900">
              {project.projectName}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <FaMapMarkerAlt className="mr-1 text-gray-400" />
              <span className="line-clamp-1">{project.projectAddress}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-500 capitalize">
              {project.projectType || "N/A"}
            </span>
            <span className="text-sm text-gray-500">
              {project.date
                ? new Date(project.date).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
          <div className="flex space-x-2">
            <Link
              to={`https://ownifie.com/projectdetail/${project.slug}`}
              target="_blank"
              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors"
              title="View Project"
            >
              <FaEye />
            </Link>
            <Link
              to={`/dashboard/${
                project.isFurniture ? "furniture" : "project"
              }/edit/${project._id}`}
              className="text-yellow-600 hover:text-yellow-800 p-2 rounded-lg hover:bg-yellow-100 transition-colors"
              title="Edit Project"
            >
              <FaEdit />
            </Link>
            <button
              onClick={() => deleteProject(project._id)}
              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition-colors"
              title="Delete Project"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Blog Table Component (for desktop)
const BlogTable = ({
  blogs,
  deleteBlog,
  toggleStatus,
  navigate,
  selectedItems,
  toggleSelectItem,
  toggleSelectAll,
  allSelected,
  requestSort,
  getSortIndicator,
}) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </th>
          <th
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => requestSort("title")}
          >
            <div className="flex items-center">
              Blog
              {getSortIndicator("title")}
            </div>
          </th>
          <th
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => requestSort("date")}
          >
            <div className="flex items-center">
              Date
              {getSortIndicator("date")}
            </div>
          </th>
          <th
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => requestSort("status")}
          >
            <div className="flex items-center">
              Status
              {getSortIndicator("status")}
            </div>
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {blogs.map((blog) => (
          <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-4">
              <input
                type="checkbox"
                checked={selectedItems.includes(blog._id)}
                onChange={() => toggleSelectItem(blog._id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td className="px-4 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-16">
                  <img
                    src={
                      blog.thumbnail?.url ||
                      "https://via.placeholder.com/80x60?text=No+Image"
                    }
                    alt={blog.title}
                    className="h-12 w-16 object-cover rounded-lg"
                  />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">
                    {blog.title}
                  </div>
                  <div className="text-sm text-gray-500 line-clamp-1">
                    {blog.content && blog.content.substring(0, 60)}...
                  </div>
                </div>
              </div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
              {blog.createdAt
                ? new Date(blog.createdAt).toLocaleDateString()
                : "N/A"}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              <button
                onClick={() => toggleStatus(blog._id, blog.status, "blog")}
                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${
                  blog.status === "active"
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-red-100 text-red-800 hover:bg-red-200"
                }`}
              >
                {blog.status || "inactive"}
              </button>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center space-x-2">
                <Link
                  to={`/blog/${blog.slug}`}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  title="View Blog"
                >
                  <FaEye />
                </Link>
                <button
                  onClick={() => navigate(`/dashboard/blog/edit/${blog.slug}`)}
                  className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                  title="Edit Blog"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteBlog(blog._id)}
                  className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Blog"
                >
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Blog Cards Component (for mobile/tablet)
const BlogCards = ({
  blogs,
  deleteBlog,
  toggleStatus,
  navigate,
  selectedItems,
  toggleSelectItem,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
    {blogs.map((blog) => (
      <div
        key={blog._id}
        className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedItems.includes(blog._id)}
                onChange={() => toggleSelectItem(blog._id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
              />
              <div className="flex-shrink-0 h-16 w-20">
                <img
                  src={
                    blog.thumbnail?.url ||
                    "https://via.placeholder.com/80x60?text=No+Image"
                  }
                  alt={blog.title}
                  className="h-16 w-20 object-cover rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={() => toggleStatus(blog._id, blog.status, "blog")}
              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${
                blog.status === "active"
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-red-100 text-red-800 hover:bg-red-200"
              }`}
            >
              {blog.status || "inactive"}
            </button>
          </div>

          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
              {blog.title}
            </h3>
            <div className="text-sm text-gray-500 mt-2 line-clamp-2">
              {blog.content && blog.content.substring(0, 100)}...
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {blog.author || "Unknown"}
            </span>
            <span className="text-sm text-gray-500">
              {blog.date ? new Date(blog.date).toLocaleDateString() : "N/A"}
            </span>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
          <div className="flex space-x-2">
            <Link
              to={`/blog/${blog.slug}`}
              target="_blank"
              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors"
              title="View Blog"
            >
              <FaEye />
            </Link>
            <button
              onClick={() => navigate(`/dashboard/blog/edit/${blog.slug}`)}
              className="text-yellow-600 hover:text-yellow-800 p-2 rounded-lg hover:bg-yellow-100 transition-colors"
              title="Edit Blog"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => deleteBlog(blog._id)}
              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition-colors"
              title="Delete Blog"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Enhanced SummaryCard component
const SummaryCard = ({ title, count, icon, bg, onClick }) => (
  <div
    className={`${bg} rounded-xl p-3 xs:p-4 sm:p-5 text-white shadow-sm transition-all hover:shadow-md ${
      onClick ? "cursor-pointer hover:scale-105" : ""
    }`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold">{count}</p>
        <p className="text-[12px] xxs:text-sm opacity-90 mt-1">{title}</p>
      </div>
      <div className="text-xl sm:text-2xl opacity-80">{icon}</div>
    </div>
  </div>
);

export default AdminIndex;