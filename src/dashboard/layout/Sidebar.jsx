// Sidebar.jsx
import React, { useContext, useState } from "react";
import { 
  AiFillDashboard, 
  AiOutlineClose
} from "react-icons/ai";
import { 
  BiNews, 
  BiChevronDown, 
  BiChevronRight 
} from "react-icons/bi";
import { 
  FaBloggerB, 
  FaPlus, 
  FaUser, 
  FaProjectDiagram 
} from "react-icons/fa";
import { IoMdContacts } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { MdQueryBuilder } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import storeContext from "../../context/storeContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { dispatch } = useContext(storeContext);
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (item) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const logout = () => {
    localStorage.removeItem("ownifieToken");
    dispatch({ type: "logout", payload: "" });
    navigate("/login");
    setIsOpen(false);
  };

  const linkClass = (path) =>
    `px-4 py-3 flex items-center gap-3 rounded-lg transition-colors ${
      pathname === path
        ? "bg-indigo-100 text-indigo-700 font-medium border-r-4 border-indigo-600"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  const isPathActive = (path) => pathname.startsWith(path);

  // ✅ Wrapper for Link that auto closes sidebar
  const LinkWrapper = ({ to, children, className }) => (
    <Link
      to={to}
      className={className}
      onClick={() => setIsOpen(false)} // <-- close sidebar
    >
      {children}
    </Link>
  );

  return (
    <div
      className={`fixed top-0 left-0 h-screen w-64 bg-white z-50 transition-transform transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 shadow-xl flex flex-col`}
    >
      {/* Logo Section */}
      <div className="flex justify-between items-center p-5 border-b border-gray-200">
        <LinkWrapper to={"/"} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Ownifie</h1>
        </LinkWrapper>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
        >
          <AiOutlineClose className="text-xl" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          <li>
            <LinkWrapper
              to="/dashboard/admin"
              className={linkClass("/dashboard/admin")}
            >
              <AiFillDashboard className="text-lg" />
              <span>Dashboard</span>
            </LinkWrapper>
          </li>

          {/* Projects Section */}
          <li>
            <button
              onClick={() => toggleExpanded("projects")}
              className={`w-full px-4 py-3 flex items-center justify-between rounded-lg transition-colors ${
                isPathActive("/dashboard/allProjects") ||
                isPathActive("/dashboard/project/add")
                  ? "bg-indigo-100 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <FaProjectDiagram className="text-lg" />
                <span>Projects</span>
              </div>
              {expandedItems["projects"] ? (
                <BiChevronDown className="text-lg" />
              ) : (
                <BiChevronRight className="text-lg" />
              )}
            </button>

            {expandedItems["projects"] && (
              <ul className="ml-4 mt-1 space-y-1 pl-7 border-l border-gray-200 ml-6">
                <li>
                  <LinkWrapper
                    to="/dashboard/allProjects"
                    className={linkClass("/dashboard/allProjects")}
                  >
                    <BiNews className="text-lg" />
                    <span>All Projects</span>
                  </LinkWrapper>
                </li>
                <li>
                  <LinkWrapper
                    to="/dashboard/project/add"
                    className={linkClass("/dashboard/project/add")}
                  >
                    <FaPlus className="text-lg" />
                    <span>Add Project</span>
                  </LinkWrapper>
                </li>
              </ul>
            )}
          </li>

          {/* Blogs Section */}
          <li>
            <button
              onClick={() => toggleExpanded("blogs")}
              className={`w-full px-4 py-3 flex items-center justify-between rounded-lg transition-colors ${
                isPathActive("/dashboard/allBlogs") ||
                isPathActive("/dashboard/blog/add")
                  ? "bg-indigo-100 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <FaBloggerB className="text-lg" />
                <span>Blogs</span>
              </div>
              {expandedItems["blogs"] ? (
                <BiChevronDown className="text-lg" />
              ) : (
                <BiChevronRight className="text-lg" />
              )}
            </button>

            {expandedItems["blogs"] && (
              <ul className="ml-4 mt-1 space-y-1 pl-7 border-l border-gray-200 ml-6">
                <li>
                  <LinkWrapper
                    to="/dashboard/allBlogs"
                    className={linkClass("/dashboard/allBlogs")}
                  >
                    <FaBloggerB className="text-lg" />
                    <span>All Blogs</span>
                  </LinkWrapper>
                </li>
                <li>
                  <LinkWrapper
                    to="/dashboard/blog/add"
                    className={linkClass("/dashboard/blog/add")}
                  >
                    <FaPlus className="text-lg" />
                    <span>Add Blog</span>
                  </LinkWrapper>
                </li>
              </ul>
            )}
          </li>

          <li>
            <LinkWrapper
              to="/dashboard/bookingQuery"
              className={linkClass("/dashboard/bookingQuery")}
            >
              <MdQueryBuilder className="text-lg" />
              <span>Booking Query</span>
            </LinkWrapper>
          </li>

          <li>
            <LinkWrapper
              to="/dashboard/contact"
              className={linkClass("/dashboard/contact")}
            >
              <IoMdContacts className="text-lg" />
              <span>Contact Query</span>
            </LinkWrapper>
          </li>

          <li>
            <LinkWrapper
              to="/dashboard/channelPartners"
              className={linkClass("/dashboard/channelPartners")}
            >
              <FaUser className="text-lg" />
              <span>Channel Partners</span>
            </LinkWrapper>
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full px-4 py-3 flex items-center gap-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <IoLogOutOutline className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
