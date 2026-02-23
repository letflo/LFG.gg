import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { matchId, winnerId } = await req.json();

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.status !== "playing") return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const totalPot = match.stake * 2;
  const rake = Math.floor(totalPot * 0.1); // ← your 10% money
  const winnerGets = totalPot - rake;

  await prisma.user.update({
    where: { id: winnerId },
    data: { balance: { increment: winnerGets } }
  });

  await prisma.match.update({
    where: { id: matchId },
    data: { status: "closed", winnerId }
  });

  console.log(`HOUSE RAKE EARNED: ${rake} tokens`);

  return NextResponse.json({ success: true });
}
