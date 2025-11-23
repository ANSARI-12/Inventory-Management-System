// import React, { useState } from "react";
// import { importProducts, exportProducts } from "../api";

// export default function Controls({ onSearch, onCategory, refresh }) {
//   const [search, setSearch] = useState("");
//   const [importing, setImporting] = useState(false);

//   const handleImport = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);
//     setImporting(true);

//     try {
//       const res = await importProducts(formData);
//       alert(`Imported: ${res.data.added}, Skipped: ${res.data.skipped}`);
//       refresh();
//     } catch (err) {
//       alert("Import failed");
//     } finally {
//       setImporting(false);
//     }
//   };

//   return (
//     <div className="controls-container">
//       <div className="left">
//         <input
//           placeholder="Search products..."
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             onSearch(e.target.value);
//           }}
//         />
//         <select onChange={(e) => onCategory(e.target.value)}>
//           <option value="">All Categories</option>
//           <option value="Electronics">Electronics</option>
//           <option value="Clothing">Clothing</option>
//           <option value="Home">Home</option>
//         </select>
//       </div>

//       <div className="right">
//         <label className="btn import-btn">
//           {importing ? "Uploading..." : "Import CSV"}
//           <input type="file" accept=".csv" hidden onChange={handleImport} />
//         </label>
//         <a
//           href={exportProducts()}
//           className="btn export-btn"
//           target="_blank"
//           rel="noreferrer"
//         >
//           Export CSV
//         </a>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import { importProducts, exportProducts, createProduct } from "../api"; // Import createProduct

export default function Controls({ onSearch, onCategory, refresh }) {
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false); // Toggle for form

  // Form State
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Electronics",
    brand: "",
    stock: 0,
    unit: "Piece",
  });

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setImporting(true);
    try {
      const res = await importProducts(formData);
      alert(`Imported: ${res.data.added}, Skipped: ${res.data.skipped}`);
      refresh();
    } catch (err) {
      alert("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct({
        ...newProduct,
        status: newProduct.stock > 0 ? "In Stock" : "Out of Stock",
      });
      setShowAddForm(false);
      setNewProduct({
        name: "",
        category: "Electronics",
        brand: "",
        stock: 0,
        unit: "Piece",
      }); // Reset
      refresh(); // Reload table
    } catch (err) {
      alert("Failed to add product");
    }
  };

  return (
    <div className="controls-container" style={{ flexDirection: "column" }}>
      {/* TOP ROW: Search & Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: "10px",
        }}
      >
        <div className="left">
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onSearch(e.target.value);
            }}
          />
          <select onChange={(e) => onCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Home">Home</option>
          </select>
        </div>

        <div className="right">
          {/* NEW ADD BUTTON */}
          <button
            className="btn btn-save"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Close Form" : "+ Add Product"}
          </button>

          <label className="btn import-btn" style={{ marginLeft: "10px" }}>
            {importing ? "Uploading..." : "Import CSV"}
            <input type="file" accept=".csv" hidden onChange={handleImport} />
          </label>
          <a
            href={exportProducts()}
            className="btn export-btn"
            target="_blank"
            rel="noreferrer"
          >
            Export CSV
          </a>
        </div>
      </div>

      {/* OPTIONAL: ADD FORM */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          style={{
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "5px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            required
            placeholder="Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            style={{ padding: "8px" }}
          />
          <input
            required
            placeholder="Brand"
            value={newProduct.brand}
            onChange={(e) =>
              setNewProduct({ ...newProduct, brand: e.target.value })
            }
            style={{ padding: "8px" }}
          />
          <select
            value={newProduct.category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, category: e.target.value })
            }
            style={{ padding: "8px" }}
          >
            <option>Electronics</option>
            <option>Clothing</option>
            <option>Home</option>
          </select>
          <input
            type="number"
            required
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: e.target.value })
            }
            style={{ padding: "8px", width: "80px" }}
          />
          <button type="submit" className="btn import-btn">
            Save
          </button>
        </form>
      )}
    </div>
  );
}
