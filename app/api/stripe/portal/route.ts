import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Billing portal is disabled in this demo deployment." },
    { status: 400 }
  );
}
