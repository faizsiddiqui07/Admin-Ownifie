import React, { useContext } from "react";
import storeContext from "../context/storeContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectDashboard = () => {
  const { store } = useContext(storeContext);

  if (store.userInfo) {
    return <Outlet />;
  } else {
    return <Navigate to={"/login"} />;
  }
};

export default ProtectDashboard;
