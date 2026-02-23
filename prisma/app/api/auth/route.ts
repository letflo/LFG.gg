import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { username, password, isLogin } = await req.json();
  const cookieStore = cookies();

  if (isLogin) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
      cookieStore.set("userId", user.id, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 60 * 60 * 24 * 7 });
      return NextResponse.json({ user: { id: user.id, username: user.username, balance: user.balance } });
    }
    return NextResponse.json({ error: "Wrong credentials" }, { status: 401 });
  } else {
    const hashed = await bcrypt.hash(password, 10);
    try {
      const user = await prisma.user.create({
        data: { username, email: username + "@example.com", password: hashed }
      });
      cookieStore.set("userId", user.id, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 60 * 60 * 24 * 7 });
      return NextResponse.json({ user: { id: user.id, username: user.username, balance: user.balance } });
    } catch {
      return NextResponse.json({ error: "Username taken" }, { status: 400 });
    }
  }
}
