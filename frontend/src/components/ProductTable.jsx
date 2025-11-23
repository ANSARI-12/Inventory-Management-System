import React, { useState } from "react";
import { updateProduct, deleteProduct } from "../api";

export default function ProductTable({ products, onSelectProduct, refresh }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditData(product);
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        ...editData,
        status: parseInt(editData.stock) > 0 ? "In Stock" : "Out of Stock",
      };

      await updateProduct(editingId, updatedData);
      setEditingId(null);
      refresh();
    } catch (error) {
      alert("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await deleteProduct(id);
      refresh();
    }
  };

  const handleChange = (e, field) => {
    setEditData({ ...editData, [field]: e.target.value });
  };

  return (
    <table className="product-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Name</th>
          <th>Category</th>
          <th>Brand</th>
          <th>Stock</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p, index) => {
          const isEditing = editingId === p.id;
          return (
            <tr key={p.id} onClick={() => !isEditing && onSelectProduct(p.id)}>
              <td>{index + 1}</td>
              <td>
                {isEditing ? (
                  <input
                    value={editData.name}
                    onChange={(e) => handleChange(e, "name")}
                  />
                ) : (
                  p.name
                )}
              </td>
              <td>
                {isEditing ? (
                  <input
                    value={editData.category}
                    onChange={(e) => handleChange(e, "category")}
                  />
                ) : (
                  p.category
                )}
              </td>
              <td>
                {isEditing ? (
                  <input
                    value={editData.brand}
                    onChange={(e) => handleChange(e, "brand")}
                  />
                ) : (
                  p.brand
                )}
              </td>
              <td>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.stock}
                    onChange={(e) => handleChange(e, "stock")}
                  />
                ) : (
                  p.stock
                )}
              </td>
              <td>
                <span className={p.stock > 0 ? "status-in" : "status-out"}>
                  {p.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </td>
              <td>
                {isEditing ? (
                  <>
                    <button onClick={handleSave} className="btn-save">
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(p);
                      }}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.id);
                      }}
                      className="btn-del"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
