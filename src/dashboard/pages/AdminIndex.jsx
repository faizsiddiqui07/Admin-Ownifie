import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { base_url } from "../../config/config";
import storeContext from "../../context/storeContext";
import { convert } from "html-to-text";
import axios from "axios";

const AdminIndex = () => {
  const { store } = useContext(storeContext);
  const [products, setProducts] = useState([]);
  const [pendingNewCount, setPendingNewCount] = useState(0);
  const [activeNewCount, setActiveNewCount] = useState(0);
  const [deactiveNewCount, setDeactiveNewCount] = useState(0);
  const [furnitureNewCount, setFurnitureNewCount] = useState(0);

  const get_products = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/allProduct`, {
        headers: { Authorization: `Bearer ${store.token}` },
      });
      setProducts(data.data);
      categorizeNews(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const categorizeNews = (newsList) => {
    let pending = 0, active = 0, deactive = 0, furniture = 0;

    newsList.forEach((item) => {
      if (item.isFurniture) furniture++;
      if (item.status === "pending") pending++;
      else if (item.status === "active") active++;
      else if (item.status === "deactive") deactive++;
    });

    setPendingNewCount(pending);
    setActiveNewCount(active);
    setDeactiveNewCount(deactive);
    setFurnitureNewCount(furniture);
  };

  useEffect(() => {
    get_products();
  }, []);

  return (
    <div className="mt-4 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard title="Total Products" count={products.length} bg="bg-slate-300" text="text-slate-700" />
        <SummaryCard title="Furniture" count={furnitureNewCount} bg="bg-yellow-100" text="text-yellow-900" />
        <SummaryCard title="Pending" count={pendingNewCount} bg="bg-blue-200" text="text-blue-900" />
        <SummaryCard title="Active" count={activeNewCount} bg="bg-green-200" text="text-green-900" />
        <SummaryCard title="Deactive" count={deactiveNewCount} bg="bg-red-200" text="text-red-900" />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-md shadow-md overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm text-slate-700">
          <thead className="text-xs uppercase bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Product Code</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Discounted</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, i) => (
              <tr key={product._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3">{product.productCode}</td>
                <td className="px-4 py-3">₹{product.price}</td>
                <td className="px-4 py-3">₹{product.discountedPrice}</td>
                <td className="px-4 py-3">
                  {product.isFurniture ? `${product.category} (Furniture)` : product.category}
                </td>
                <td className="px-4 py-3">{convert(product.description).slice(0, 40)}...</td>
                <td className="px-4 py-3">
                  {product.productImage[0]?.url ? (
                    <img
                      src={product.productImage[0].url}
                      alt={product.productCode}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400 italic text-xs">No image</span>
                  )}
                </td>
                <td className="px-4 py-3">{product.date}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-start">
                    <Link
                      to={`http://localhost:5174/productDetails/${product.slug}`}
                      target="_blank"
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                    >
                      <FaEye />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// SummaryCard component
const SummaryCard = ({ title, count, bg, text }) => (
  <div className={`w-full p-5 flex flex-col items-center rounded-md ${bg} ${text}`}>
    <span className="text-2xl font-bold">{count}</span>
    <span className="text-base">{title}</span>
  </div>
);

export default AdminIndex;
