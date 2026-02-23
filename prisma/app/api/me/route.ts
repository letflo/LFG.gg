import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function GET() {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, balance: true }
  });

  return NextResponse.json({ user });
}
