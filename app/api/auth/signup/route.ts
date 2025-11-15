import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/app/models/User";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, userType } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUserByEmail = await User.findByEmail(email.toLowerCase());
    if (existingUserByEmail) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }

    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return NextResponse.json({ error: "User already exists with this username" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      userType: userType || 'student',
      profile: {},
    });

    return NextResponse.json({ 
      message: "User created successfully",
      userId: user.id 
    });

  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}