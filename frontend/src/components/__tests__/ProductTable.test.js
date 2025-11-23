import React from "react";
// 2. FIX: ADD waitFor TO IMPORTS
// This resolves the "ReferenceError: waitFor is not defined" error.
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductTable from "../ProductTable";
import * as api from "../../api"; // Import your API module

// Mock the API function called on Save
// This ensures the update is successful and the refresh() call is reached.
jest.mock("../../api", () => ({
  updateProduct: jest.fn().mockResolvedValue({ message: "Update successful" }),
}));

// Temporary Mock for window.alert to fix JSDOM error.
// Recommendation: Replace alert() in ProductTable.jsx with a proper modal/toast.
beforeAll(() => {
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

const sampleProducts = [
  {
    id: 1,
    name: "Product A",
    category: "Electronics",
    brand: "Brand X",
    stock: 10,
  },
  {
    id: 2,
    name: "Product B",
    category: "Clothing",
    brand: "Brand Y",
    stock: 0,
  },
];

describe("ProductTable Component", () => {
  const onSelectProduct = jest.fn();
  const refresh = jest.fn();

  beforeEach(() => {
    // Reset the mock before each test to ensure accurate call counts
    api.updateProduct.mockClear();
    refresh.mockClear();
  });

  test("renders product rows correctly", () => {
    render(
      <ProductTable
        products={sampleProducts}
        onSelectProduct={onSelectProduct}
        refresh={refresh}
      />
    );

    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
  });

  test("calls onSelectProduct when row clicked", () => {
    render(
      <ProductTable
        products={sampleProducts}
        onSelectProduct={onSelectProduct}
        refresh={refresh}
      />
    );

    fireEvent.click(screen.getByText("Product A"));
    expect(onSelectProduct).toHaveBeenCalledWith(1);
  });

  test("editing a product updates and calls refresh", async () => {
    render(
      <ProductTable
        products={sampleProducts}
        onSelectProduct={onSelectProduct}
        refresh={refresh}
      />
    );

    // 1. Click 'Edit' button
    fireEvent.click(screen.getAllByText("Edit")[0]);

    // 2. FIX: Find the input field using its *initial* value ("Product A"),
    // not the target value ("Product A Updated"), which caused the failure.
    const nameInput = screen.getByDisplayValue("Product A");

    // 3. Change the value to the final desired value
    fireEvent.change(nameInput, {
      target: { value: "Product A Final" },
    });

    // 4. Click Save
    fireEvent.click(screen.getByText("Save"));

    // refresh should be called after saving successfully
    // The test will now wait for the mocked API call to resolve and the success path (which calls refresh) to execute.
    await waitFor(() => {
      expect(api.updateProduct).toHaveBeenCalled(); // Ensure the API call happened
      expect(refresh).toHaveBeenCalled();
    });
  });
});
