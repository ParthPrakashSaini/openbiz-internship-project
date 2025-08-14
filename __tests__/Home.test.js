import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../app/page"; // This path should point to your main form component

describe("Udyam Registration Form", () => {
  // Test 1: Checks if the main heading renders on the page.
  it("renders the main heading", () => {
    render(<App />);

    const heading = screen.getByRole("heading", {
      name: /UDYAM REGISTRATION FORM/i,
    });

    expect(heading).toBeInTheDocument();
  });

  // Test 2: Checks if client-side validation shows an error.
  it("shows an error message for an invalid Aadhaar number", async () => {
    render(<App />);

    // Find all the interactive elements
    const aadhaarInput = screen.getByLabelText(/1. Aadhaar Number/i);
    const consentCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", {
      name: /Validate & Generate OTP/i,
    });

    // --- Simulate User Actions ---
    // 1. Type an invalid number into the Aadhaar input
    fireEvent.change(aadhaarInput, { target: { value: "12345" } });

    // 2. Click the consent checkbox to enable the submit button
    fireEvent.click(consentCheckbox);

    // 3. Click the submit button
    fireEvent.click(submitButton);

    // --- Assert the Outcome ---
    // Use findByText which waits for the error message to appear
    const errorMessage = await screen.findByText(
      "Aadhaar number must be 12 digits."
    );

    expect(errorMessage).toBeInTheDocument();
  });
});
