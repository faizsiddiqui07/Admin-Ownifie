import { Link } from "react-router-dom";
import ProjectComponent from "../components/ProjectComponent";

const AllProjects = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1230px] mx-auto">
        <div className="overflow-hidden">
          <ProjectComponent />
        </div>
      </div>
    </div>
  );
};

export default AllProjects;
