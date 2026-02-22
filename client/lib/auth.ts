"use server";

import { compare } from "bcrypt-ts";
import { createSecretKey } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const valid_hashed_pass = process.env.HASHED_PASSWORD;
const valid_username = process.env.WEB_USERNAME;

const secretKey = createSecretKey(process.env.JWT_SECRET!, "utf-8");

async function generateJWT(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt() // default to now()
    .setIssuer(process.env.JWT_ISSUER!)
    .setAudience(process.env.JWT_AUDIENCE!)
    .setExpirationTime(process.env.JWT_EXPIRATION_TIME!)
    .sign(secretKey);

  return token;
}

async function verifyCredentials(username: string, pass: string) {
  if (!valid_hashed_pass) {
    throw new Error("Password hasn't been set");
  }

  const isPasswordValid = await compare(pass, valid_hashed_pass);

  return username === valid_username && isPasswordValid;
}

export async function verifyToken() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("devhub.access_token")?.value;

  if (!accessToken) {
    console.warn("Access token not found in cookies");
    return false;
  }

  try {
    const { payload } = await jwtVerify(accessToken, secretKey, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });

    return payload;
  } catch (e) {
    console.warn("Token is invalid", e);
    return false;
  }
}

export async function signIn(username: string, pass: string) {
  const isVerified = await verifyCredentials(username, pass);

  if (!isVerified) {
    throw new Error("Invalid credentials");
  }

  const accessToken = await generateJWT();
  const cookieStore = await cookies();
  cookieStore.set("devhub.access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 1 day
  });
}
