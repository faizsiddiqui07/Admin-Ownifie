import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaTimes
} from "react-icons/fa";
import { BsGrid3X3Gap, BsListUl } from "react-icons/bs";
import axios from "axios";
import storeContext from "../../context/storeContext";
import toast from "react-hot-toast";
import { base_url } from "../../config/config";

const ProjectComponent = () => {
  const { store } = useContext(storeContext);
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [parPage, setParPage] = useState(() => {
    return window.innerWidth < 768 ? 6 : 10;
  });
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [res, setRes] = useState({
    id: "",
    loader: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState(() => {
    return window.innerWidth < 768 ? "grid" : "list";
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-switch view mode on mobile
      if (mobile && viewMode === "list") {
        setViewMode("grid");
      }

      // Adjust items per page based on screen size
      if (window.innerWidth < 768 && parPage !== 6) {
        setParPage(6);
      } else if (window.innerWidth >= 768 && parPage === 6) {
        setParPage(10);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode, parPage]);

  const get_projects = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/allProjects`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      setAllProjects(data.data);
      setProjects(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    get_projects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      const calculate_page = Math.ceil(projects.length / parPage);
      setPages(calculate_page);
    }
  }, [projects, parPage]);

  const type_filter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);

    if (value === "") {
      setProjects(allProjects);
    } else {
      const filteredProjects = allProjects.filter(
        (project) => project.status === value
      );
      setProjects(filteredProjects);
    }
    setPage(1);
  };

  const search_project = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setProjects(allProjects);
    } else {
      const filteredProjects = allProjects.filter(
        (project) =>
          project.projectName.toLowerCase().includes(query) ||
          (project.projectAddress &&
            project.projectAddress.toLowerCase().includes(query))
      );
      setProjects(filteredProjects);
    }
    setPage(1);
  };

  const update_status = async (status, projectId) => {
    try {
      setRes({
        id: projectId,
        loader: true,
      });
      const { data } = await axios.put(
        `${base_url}/api/project/status-update/${projectId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );
      setRes({
        id: "",
        loader: false,
      });
      toast.success(data.message);
      get_projects();
    } catch (error) {
      setRes({
        id: "",
        loader: false,
      });
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const delete_project = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`${base_url}/api/delete/${projectId}`, {
          headers: { Authorization: `Bearer ${store.token}` },
        });
        toast.success("Project deleted successfully");
        get_projects();
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "deactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const StatusBadge = ({ status, projectId }) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
        status
      )} cursor-pointer transition-all hover:opacity-90 flex items-center justify-center min-w-[70px]`}
      onClick={() =>
        update_status(status === "active" ? "deactive" : "active", projectId)
      }
    >
      {res.loader && res.id === projectId ? (
        <div className="w-3 h-3 border-2 border-t-transparent border-current rounded-full animate-spin mx-auto"></div>
      ) : (
        status.charAt(0).toUpperCase() + status.slice(1)
      )}
    </span>
  );

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm overflow-hidden mt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Project Management</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {projects.length} {projects.length === 1 ? "project" : "projects"} found
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 sm:p-2 rounded-md ${
                viewMode === "grid" ? "bg-white shadow-sm text-purple-600" : "text-gray-500"
              }`}
              title="Grid View"
            >
              <BsGrid3X3Gap className="text-xs sm:text-sm" />
            </button>
            <button
              onClick={() => !isMobile && setViewMode("list")}
              className={`p-1.5 sm:p-2 rounded-md ${
                viewMode === "list" ? "bg-white shadow-sm text-purple-600" : "text-gray-500"
              } ${isMobile ? "opacity-50 cursor-not-allowed" : ""}`}
              title="List View"
              disabled={isMobile}
            >
              <BsListUl className="text-xs sm:text-sm" />
            </button>
          </div>

          <Link
            to="/dashboard/project/add"
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white text-xs sm:text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
          >
            <FaPlus className="text-xs" />
            <span>Add New Project</span>
          </Link>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 text-xs sm:text-sm" />
            </div>
            <input
              type="text"
              onChange={search_project}
              value={searchQuery}
              placeholder="Search projects by name or address..."
              className="pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="flex gap-3">
            <div className="md:hidden">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors w-full"
              >
                <FaFilter className="text-xs sm:text-sm" />
                <span>Filters</span>
              </button>
            </div>
            
            <div className={`${isFilterOpen ? 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4' : 'hidden'} md:block md:relative`}>
              {isFilterOpen && (
                <div className="bg-white rounded-xl p-5 w-full max-w-sm md:max-w-none">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Filters</h3>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaFilter className="text-gray-400 text-xs sm:text-sm" />
                    </div>
                    <select
                      onChange={type_filter}
                      value={statusFilter}
                      className="pl-10 pr-8 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none bg-white transition-all text-sm w-full"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="deactive">Deactive</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="mt-4 w-full bg-purple-600 text-white py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              )}
              
              {!isFilterOpen && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFilter className="text-gray-400 text-xs sm:text-sm" />
                  </div>
                  <select
                    onChange={type_filter}
                    value={statusFilter}
                    className="pl-10 pr-8 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none bg-white transition-all text-sm w-full"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="deactive">Deactive</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid View */}
      {viewMode === "grid" && (
        <div className="p-3 sm:p-4 md:p-6">
          {projects.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-300 text-4xl sm:text-5xl mb-3 sm:mb-4">📁</div>
              <h3 className="text-base sm:text-lg font-medium text-gray-600">
                No projects found
              </h3>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                {searchQuery || statusFilter
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first project"}
              </p>
              {!(searchQuery || statusFilter) && (
                <Link
                  to="/dashboard/project/add"
                  className="inline-flex items-center gap-2 px-4 py-2 mt-3 sm:mt-4 bg-purple-600 rounded-lg text-white text-xs sm:text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  <FaPlus className="text-xs" />
                  Add New Project
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {projects
                .slice((page - 1) * parPage, page * parPage)
                .map((project, index) => (
                  <div
                    key={project._id}
                    className="bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative">
                      {project.projectImages?.[0] ? (
                        <img
                          src={project.projectImages[0].url}
                          alt={project.projectName}
                          className="w-full h-40 sm:h-48 object-cover rounded-t-lg sm:rounded-t-xl"
                        />
                      ) : (
                        <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-lg sm:rounded-t-xl">
                          <span className="text-gray-300 text-3xl sm:text-4xl">🏗️</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <StatusBadge
                          status={project.status}
                          projectId={project._id}
                        />
                      </div>
                    </div>

                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {project.projectName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                        {project.projectAddress}
                      </p>

                      <div className="flex items-center justify-between mt-3 sm:mt-4">
                        <span className="text-xs text-gray-500">
                          {project.date}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                          {project.projectType || "Project"}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                        <Link
                          to={`http://localhost:3000/project/${project.slug}`}
                          target="_blank"
                          className="flex-1 text-center bg-green-500 text-white py-1.5 sm:py-2 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                          title="View Project"
                        >
                          <FaEye className="text-xs" />
                          <span className="hidden xs:inline">View</span>
                        </Link>
                        <Link
                          to={`/dashboard/${
                            project.isFurniture ? "furniture" : "project"
                          }/edit/${project._id}`}
                          className="flex-1 text-center bg-yellow-500 text-white py-1.5 sm:py-2 rounded-lg text-xs font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-1"
                          title="Edit Project"
                        >
                          <FaEdit className="text-xs" />
                          <span className="hidden xs:inline">Edit</span>
                        </Link>
                        <button
                          onClick={() => delete_project(project._id)}
                          className="flex-1 text-center bg-red-500 text-white py-1.5 sm:py-2 rounded-lg text-xs font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                          title="Delete Project"
                        >
                          <FaTrash className="text-xs" />
                          <span className="hidden xs:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Projects List View with Horizontal Scroll */}
      {viewMode === "list" && (
        <div className="p-3 sm:p-4 md:p-6 overflow-hidden">
          {projects.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-300 text-4xl sm:text-5xl mb-3 sm:mb-4">📁</div>
              <h3 className="text-base sm:text-lg font-medium text-gray-600">
                No projects found
              </h3>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                {searchQuery || statusFilter
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first project"}
              </p>
              {!(searchQuery || statusFilter) && (
                <Link
                  to="/dashboard/project/add"
                  className="inline-flex items-center gap-2 px-4 py-2 mt-3 sm:mt-4 bg-purple-600 rounded-lg text-white text-xs sm:text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  <FaPlus className="text-xs" />
                  Add New Project
                </Link>
              )}
            </div>
          ) : (
            <div className="w-[1000px] rounded-lg sm:rounded-xl overflow-x-auto border border-gray-200 shadow-sm">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects
                    .slice((page - 1) * parPage, page * parPage)
                    .map((project, index) => (
                      <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {project.projectImages?.[0] ? (
                              <img
                                src={project.projectImages[0].url}
                                alt={project.projectName}
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <span className="text-gray-400 text-xs">🏗️</span>
                              </div>
                            )}
                            <div className="ml-3">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">
                                {project.projectName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-500 max-w-xs truncate">
                            {project.projectAddress}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {project.projectType}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {project.date}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge
                            status={project.status}
                            projectId={project._id}
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`http://localhost:3000/project/${project.slug}`}
                              target="_blank"
                              className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors"
                              title="View Project"
                            >
                              <FaEye className="text-xs sm:text-sm" />
                            </Link>
                            <Link
                              to={`/dashboard/${
                                project.isFurniture ? "furniture" : "project"
                              }/edit/${project._id}`}
                              className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50 transition-colors"
                              title="Edit Project"
                            >
                              <FaEdit className="text-xs sm:text-sm" />
                            </Link>
                            <button
                              onClick={() => delete_project(project._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                              title="Delete Project"
                            >
                              <FaTrash className="text-xs sm:text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {projects.length > 0 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-gray-600">
                Projects per page:
              </span>
              <select
                value={parPage}
                onChange={(e) => {
                  setParPage(parseInt(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-xs sm:text-sm"
              >
                <option value="6">6</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="flex flex-col xs:flex-row items-center gap-4">
              <span className="text-xs sm:text-sm text-gray-600">
                Showing {(page - 1) * parPage + 1} to{" "}
                {Math.min(page * parPage, projects.length)} of {projects.length}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => page > 1 && setPage(page - 1)}
                  disabled={page === 1}
                  className={`p-1.5 sm:p-2 rounded-md ${
                    page === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaChevronLeft className="text-xs sm:text-sm" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                    let pageNum;
                    if (pages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pages - 2) {
                      pageNum = pages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md text-xs sm:text-sm ${
                          page === pageNum
                            ? "bg-purple-600 text-white"
                            : "text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {pages > 5 && page < pages - 2 && (
                    <>
                      <span className="px-1 text-xs sm:text-sm flex items-center">...</span>
                      <button
                        onClick={() => setPage(pages)}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-md text-xs sm:text-sm text-gray-600 hover:bg-gray-200"
                      >
                        {pages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => page < pages && setPage(page + 1)}
                  disabled={page === pages}
                  className={`p-1.5 sm:p-2 rounded-md ${
                    page === pages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaChevronRight className="text-xs sm:text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectComponent;