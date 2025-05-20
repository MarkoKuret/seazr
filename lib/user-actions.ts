"use server";

import bcrypt from "bcrypt";
import { prisma } from "./prisma";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { success: false, message: "Email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    return { success: true, message: "User registered successfully" };
  } catch (error) {
    console.error("Error during registration:", error);
    return { success: false, message: "Error registering user" };
  }
}