import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import StorePovider from "./context/storeProvider.jsx";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StorePovider>
    <>
      <App />
      <Toaster />
    </>
  </StorePovider>
);
