import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function GET() {
  const open = await prisma.match.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ open });
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { stake, gameMode } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.balance < stake) return NextResponse.json({ error: "Not enough tokens" }, { status: 400 });

  await prisma.user.update({
    where: { id: userId },
    data: { balance: { decrement: stake } }
  });

  const match = await prisma.match.create({
    data: { creatorId: userId, stake, gameMode: gameMode || "1v1 Box Fight" }
  });

  return NextResponse.json({ success: true, match });
}
