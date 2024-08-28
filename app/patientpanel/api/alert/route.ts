import { NextResponse } from 'next/server';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID as string,
  process.env.TWILIO_AUTH_TOKEN as string
);

export async function POST(request: Request) {
  const { phoneNumber } = await request.json();
  
  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }

  try {
    await client.messages.create({
      body: 'Medicine has been taken.',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}