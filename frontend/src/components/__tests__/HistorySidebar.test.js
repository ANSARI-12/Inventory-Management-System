import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import HistorySidebar from "../HistorySidebar";
import * as api from "../../api";

const sampleHistory = [
  {
    id: 1,
    product_id: 1,
    old_stock: 10,
    new_stock: 5,
    changed_by: "Admin",
    timestamp: "2024-01-01 10:00:00",
  },
  {
    id: 2,
    product_id: 1,
    old_stock: 5,
    new_stock: 3,
    changed_by: "Admin",
    timestamp: "2024-01-02 12:00:00",
  },
];

describe("HistorySidebar Component", () => {
  beforeEach(() => {
    jest.spyOn(api, "getHistory").mockResolvedValue({ data: sampleHistory });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders history records", async () => {
    render(<HistorySidebar productId={1} onClose={() => {}} />);

    await waitFor(() => {
      const changedByElements = screen.getAllByText(/Changed by: Admin/i);
      expect(changedByElements.length).toBeGreaterThan(0);
      const oldStockElements = screen.getAllByText(/10/);
      expect(oldStockElements.length).toBeGreaterThan(0);
      const newStockElements = screen.getAllByText(/5/);
      expect(newStockElements.length).toBeGreaterThan(0);
    });
  });

  test("renders no history message when empty", async () => {
    api.getHistory.mockResolvedValueOnce({ data: [] });
    render(<HistorySidebar productId={1} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText(/No history available/i)).toBeInTheDocument();
    });
  });
});
