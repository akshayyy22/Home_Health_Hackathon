import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const { medicineId, medicineName, medicinePrice } = await req.json();

    console.log('Creating checkout session with:', { medicineId, medicineName, medicinePrice });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: medicineName,
            },
            unit_amount: Math.round(medicinePrice * 100), // price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?medicineId=${medicineId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['IN'],
      },
    });

    console.log('Checkout session created:', session);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session', details: (error as Error).message }, { status: 500 });
  }
}
