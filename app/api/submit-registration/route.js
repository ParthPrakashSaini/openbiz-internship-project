// app/api/submit-registration/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  console.log("--- SUBMIT REGISTRATION API HIT ---"); // 1. Check if the API is being called

  try {
    const body = await request.json();
    const { aadhaarNumber, name, panNumber } = body;
    console.log("2. Received data:", body); // 2. Check if data is received correctly

    // --- Server-side Validation ---
    if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      return NextResponse.json(
        { success: false, message: "A valid PAN number is required." },
        { status: 400 }
      );
    }
    console.log("3. Validation passed."); // 3. Check if validation succeeds

    // --- Database Interaction using Prisma ---
    console.log("4. Attempting to save to database..."); // 4. Check if we're about to call Prisma
    const newUser = await prisma.registration.create({
      data: {
        aadhaarNumber,
        name,
        panNumber,
      },
    });

    console.log("5. SUCCESS! New user created in database:", newUser); // 5. This will only log if the save is successful

    // --- Respond to the Client ---
    return NextResponse.json({
      success: true,
      message: "Registration completed and saved successfully!",
    });
  } catch (error) {
    // 6. If there is ANY error, it will be caught here.
    console.error("---!!! API ERROR !!!---");
    console.error("6. The error object is:", error); // This will give us the full details of the error.

    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      return NextResponse.json(
        { success: false, message: `This ${field} is already registered.` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
