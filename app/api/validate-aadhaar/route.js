// app/api/validate-aadhaar/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { aadhaarNumber, name } = await request.json();

    // --- Server-side Validation ---
    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid 12-digit Aadhaar number is required.",
        },
        { status: 400 }
      );
    }

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400 }
      );
    }

    // --- Business Logic ---
    console.log(`Simulating OTP generation for Aadhaar: ${aadhaarNumber}`);

    // --- Respond to the Client ---
    return NextResponse.json({
      success: true,
      message: "OTP has been sent successfully.",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
