import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { matchId } = await req.json();

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!match || match.status !== "open" || !user || user.balance < match.stake) {
    return NextResponse.json({ error: "Cannot join" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { balance: { decrement: match.stake } }
  });

  await prisma.match.update({
    where: { id: matchId },
    data: { opponentId: userId, status: "playing" }
  });

  return NextResponse.json({ success: true });
}
