// import React, { useEffect, useState } from "react";
// import "./App.css";
// import Controls from "./components/Controls";
// import ProductTable from "./components/ProductTable";
// import HistorySidebar from "./components/HistorySidebar";
// import { getProducts } from "./api";

// function App() {
//   const [products, setProducts] = useState([]);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("");
//   const [selectedProductId, setSelectedProductId] = useState(null);
//   const [error, setError] = useState(null); // Store error messages

//   const loadData = async () => {
//     try {
//       setError(null);
//       const res = await getProducts(search, category);
//       // SAFETY CHECK: Ensure we received an array
//       if (Array.isArray(res.data)) {
//         setProducts(res.data);
//       } else {
//         console.error("API did not return an array:", res.data);
//         setProducts([]); // Fallback to empty list
//       }
//     } catch (err) {
//       console.error("Error loading products:", err);
//       setError("Failed to connect to Backend. Is it running?");
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, [search, category]);

//   return (
//     <div className="app-container">
//       <header>
//         <h1>Inventory Management</h1>
//       </header>

//       {/* Show Error Message if Backend is down */}
//       {error && (
//         <div
//           style={{
//             padding: "10px",
//             background: "#ffdddd",
//             color: "red",
//             marginBottom: "20px",
//             borderRadius: "5px",
//           }}
//         >
//           <strong>Error:</strong> {error}
//         </div>
//       )}

//       <Controls
//         onSearch={setSearch}
//         onCategory={setCategory}
//         refresh={loadData}
//       />

//       <div className="main-content">
//         {/* SAFETY CHECK: Only render table if products is valid */}
//         <ProductTable
//           products={products || []}
//           onSelectProduct={setSelectedProductId}
//           refresh={loadData}
//         />
//       </div>

//       {selectedProductId && (
//         <HistorySidebar
//           productId={selectedProductId}
//           onClose={() => setSelectedProductId(null)}
//         />
//       )}
//     </div>
//   );
// }

// export default App;
import React, { useEffect, useState } from "react";
import "./App.css";
import Controls from "./components/Controls";
import ProductTable from "./components/ProductTable";
import HistorySidebar from "./components/HistorySidebar";
import Login from "./components/Login";
import { getProducts } from "./api";

function App() {
  // 1. DECLARE ALL HOOKS FIRST
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [error, setError] = useState(null);

  // 2. DEFINE FUNCTIONS
  const loadData = async () => {
    if (!token) return;

    try {
      setError(null);
      const res = await getProducts(search, category);
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to connect to Backend.");
    }
  };

  // 3. USE EFFECT
  useEffect(() => {
    if (token) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, token]);

  // 4. CONDITIONAL RENDERING
  if (!token) {
    return <Login onLogin={() => setToken(localStorage.getItem("token"))} />;
  }

  // 5. MAIN RENDER
  return (
    <div className="app-container">
      {/* HEADER SECTION */}
      <header className="app-header">
        <h1>Inventory Management System</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            setToken(null);
          }}
          className="btn btn-del logout-btn"
        >
          Logout
        </button>
      </header>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* CONTROLS (Search, Filter, Add) */}
      <Controls
        onSearch={setSearch}
        onCategory={setCategory}
        refresh={loadData}
      />

      {/* DATA TABLE */}
      <div className="main-content">
        <ProductTable
          products={products || []}
          onSelectProduct={setSelectedProductId}
          refresh={loadData}
        />
      </div>

      {/* SIDEBAR */}
      {selectedProductId && (
        <HistorySidebar
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
}

export default App;
