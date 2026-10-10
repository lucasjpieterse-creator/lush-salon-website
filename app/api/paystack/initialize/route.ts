import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, amount, metadata } = await req.json();

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY is missing in environment variables." },
        { status: 500 }
      );
    }

    // Amount in Paystack must be passed in kobo/cents (multiply ZAR by 100)
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email || "customer@hustlehubsecunda.co.za",
        amount: Math.round(amount * 100),
        currency: "ZAR",
        callback_url: `https://hustlehubsecunda.co.za/${metadata?.slug || ""}?payment=success`,
        metadata,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}