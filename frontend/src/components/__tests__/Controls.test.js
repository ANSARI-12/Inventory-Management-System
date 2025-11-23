import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Controls from "../Controls";

describe("Controls Component", () => {
  test("calls onSearch when input value changes", () => {
    const onSearchMock = jest.fn();
    const onCategoryMock = jest.fn();
    const refreshMock = jest.fn();

    render(
      <Controls
        onSearch={onSearchMock}
        onCategory={onCategoryMock}
        refresh={refreshMock}
      />
    );

    const input = screen.getByPlaceholderText(/search products/i);

    fireEvent.change(input, { target: { value: "test search" } });
    expect(onSearchMock).toHaveBeenCalledWith("test search");
  });
});
