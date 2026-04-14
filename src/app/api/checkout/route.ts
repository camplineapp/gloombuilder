import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    const cents = Math.round(Number(amount) * 100);

    if (!cents || cents < 100) {
      return NextResponse.json({ error: "Minimum donation is $1" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Support GloomBuilder",
              description: `$${amount} donation — Built by a PAX for the PAX`,
            },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/success?amount=${amount}`,
      cancel_url: `${req.nextUrl.origin}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
