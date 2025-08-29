import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MainLayout from "./dashboard/layout/MainLayout";
import AdminIndex from "./dashboard/pages/AdminIndex";
import Login from "./dashboard/pages/Login";
import ProtectDashboard from "./middleware/ProtectDashboard";
import notFoundImage from '../src/assets/404.png' 
import AddProject from "./dashboard/pages/AddProject";
import EditProject from "./dashboard/pages/EditProject";
import AllProjects from "./dashboard/pages/AllProjects";
import ContactQuerry from "./dashboard/pages/ContactQuerry";
import BookingQuery from "./dashboard/pages/BookingQuery";
import AddBlog from "./dashboard/pages/AddBlog";
import AllBlogs from "./dashboard/pages/AllBlogs";
import EditBlog from "./dashboard/pages/EditBlog";
import ChannelPartner from "./dashboard/pages/ChannelPartner";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectDashboard />}>
            <Route path="" element={<MainLayout />}>
              <Route path="admin" element={<AdminIndex />} />
              <Route path="allProjects" element={<AllProjects />} />
              <Route path="project/add" element={<AddProject />} />
              <Route path="project/edit/:project_id" element={<EditProject />} />
              <Route path="allBlogs" element={<AllBlogs />} />
              <Route path="blog/add" element={<AddBlog />} />
              <Route path="blog/edit/:slug" element={<EditBlog />} />
              <Route path="contact" element={<ContactQuerry />} />
              <Route path="bookingQuery" element={<BookingQuery />} />
              <Route path="channelPartners" element={<ChannelPartner />} />
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <div className="w-full h-screen flex justify-center items-center">
                <img src={notFoundImage} alt="" />
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
