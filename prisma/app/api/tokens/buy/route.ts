import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { balance: { increment: 1000 } }
  });

  return NextResponse.json({ success: true, newBalance: user.balance });
}
