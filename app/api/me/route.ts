import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isBillingEnabled } from "@/lib/billing";
import { getUsageSnapshotForUser } from "@/lib/usage";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getUsageSnapshotForUser(session.user.id);
  if (!snapshot) {
    return NextResponse.json(
      { error: "Профиль не найден в базе. Выйдите и войдите снова." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    billingEnabled: isBillingEnabled(),
    user: {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      plan: snapshot.plan,
      hasBilling: snapshot.hasBilling,
    },
    usage: { used: snapshot.used, limit: snapshot.limit },
  });
}
