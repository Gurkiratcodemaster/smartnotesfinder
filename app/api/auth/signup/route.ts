import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/app/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, userType } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUserByEmail = await User.findByEmail(email.toLowerCase());
    if (existingUserByEmail) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      userType: userType || 'student',
    });

    return NextResponse.json({ 
      message: "User created successfully",
      userId: user.id 
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}