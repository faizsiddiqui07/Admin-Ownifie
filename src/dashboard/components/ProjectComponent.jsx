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
  FaTimes,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEllipsisV
} from "react-icons/fa";
import axios from "axios";
import storeContext from "../../context/storeContext";
import toast from "react-hot-toast";
import { base_url } from "../../config/config";

const ProjectComponent = () => {
  const { store } = useContext(storeContext);
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [parPage, setParPage] = useState(() => {
    return window.innerWidth < 768 ? 6 : 12;
  });
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [res, setRes] = useState({
    id: "",
    loader: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Adjust items per page based on screen size
      if (window.innerWidth < 768 && parPage !== 6) {
        setParPage(6);
      } else if (window.innerWidth >= 768 && parPage === 6) {
        setParPage(12);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [parPage]);

  const get_projects = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/allProjects`);
      console.log("dataa",data.data);
      

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
        return "bg-green-100 text-green-800 border-green-200";
      case "deactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const StatusBadge = ({ status, projectId }) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
        status
      )} cursor-pointer transition-all hover:opacity-90 flex items-center justify-center min-w-[80px]`}
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

  // Sort projects
  const sortProjects = (criteria) => {
    let sorted = [...projects];
    switch (criteria) {
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "name":
        sorted.sort((a, b) => a.projectName.localeCompare(b.projectName));
        break;
      default:
        break;
    }
    setProjects(sorted);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Portfolio</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and showcase your property projects
          </p>
        </div>

        <Link
          to="/dashboard/project/add"
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <FaPlus className="text-sm" />
          <span>Add New Project</span>
        </Link>
      </div>

      {/* Filters and Controls */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              onChange={search_project}
              value={searchQuery}
              placeholder="Search projects by name or location..."
              className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                onChange={type_filter}
                value={statusFilter}
                className="pl-10 pr-8 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none bg-white transition-all"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="deactive">Deactive</option>
              </select>
            </div>

            <div className="relative">
              <select
                onChange={(e) => {
                  setSortBy(e.target.value);
                  sortProjects(e.target.value);
                }}
                value={sortBy}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none bg-white transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{projects.length}</span> projects
          {searchQuery && (
            <span> for "<span className="font-semibold">{searchQuery}</span>"</span>
          )}
          {statusFilter && (
            <span> with status <span className="font-semibold">{statusFilter}</span></span>
          )}
        </p>
      </div>

      {/* Projects Grid View */}
      <div className="p-6">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-6xl mb-4">🏗️</div>
            <h3 className="text-lg font-medium text-gray-600">
              No projects found
            </h3>
            <p className="text-gray-500 mt-1">
              {searchQuery || statusFilter
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first project"}
            </p>
            {!(searchQuery || statusFilter) && (
              <Link
                to="/dashboard/project/add"
                className="inline-flex items-center gap-2 px-6 py-3 mt-4 bg-purple-600 rounded-xl text-white font-medium hover:bg-purple-700 transition-colors"
              >
                <FaPlus />
                Add New Project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {projects
              .slice((page - 1) * parPage, page * parPage)
              .map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative">
                    {project.projectImages?.[0] ? (
                      <img
                        src={project.projectImages[0].url}
                        alt={project.projectName}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-300 text-5xl">🏗️</span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <StatusBadge
                        status={project.status}
                        projectId={project._id}
                      />
                    </div>
                    
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs rounded-full">
                        {project.projectType || "Project"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
                      {project.projectName}
                    </h3>
                    
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <FaMapMarkerAlt className="mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{project.projectAddress}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <FaCalendarAlt className="mr-2 flex-shrink-0" />
                      <span>{project.date}</span>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500">Active</span>
                      </div>
                      <span className="text-xs text-gray-500">ID: {project._id.slice(-6)}</span>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Link
                        to={`http://localhost:3000/project/${project.slug}`}
                        target="_blank"
                        className="flex-1 text-center bg-green-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        title="View Project"
                      >
                        <FaEye className="text-xs" />
                        <span>View</span>
                      </Link>
                      <Link
                        to={`/dashboard/${
                          project.isFurniture ? "furniture" : "project"
                        }/edit/${project._id}`}
                        className="flex-1 text-center bg-yellow-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                        title="Edit Project"
                      >
                        <FaEdit className="text-xs" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => delete_project(project._id)}
                        className="flex-1 text-center bg-red-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        title="Delete Project"
                      >
                        <FaTrash className="text-xs" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {projects.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Projects per page:
              </span>
              <select
                value={parPage}
                onChange={(e) => {
                  setParPage(parseInt(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              >
                <option value="6">6</option>
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
              </select>
            </div>

            <div className="flex flex-col xs:flex-row items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {(page - 1) * parPage + 1} to{" "}
                {Math.min(page * parPage, projects.length)} of {projects.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => page > 1 && setPage(page - 1)}
                  disabled={page === 1}
                  className={`p-2 rounded-lg ${
                    page === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaChevronLeft />
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
                        className={`w-10 h-10 rounded-lg text-sm ${
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
                      <span className="px-2 flex items-center">...</span>
                      <button
                        onClick={() => setPage(pages)}
                        className="w-10 h-10 rounded-lg text-sm text-gray-600 hover:bg-gray-200"
                      >
                        {pages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => page < pages && setPage(page + 1)}
                  disabled={page === pages}
                  className={`p-2 rounded-lg ${
                    page === pages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaChevronRight />
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