import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { orderId: string };

// (اختياري) لو عندك دوال لجلب توكن البايبال
// async function getPayPalAccessToken() { ... }

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> } // <-- أهم تعديل
) {
  const { orderId } = await params;            // <-- لازم await

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  }

  try {
    // مثال عملي (عدّل حسب مشروعك):
    // const accessToken = await getPayPalAccessToken();
    // const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${accessToken}`,
    //   },
    //   cache: 'no-store',
    // });
    // const data = await res.json();

    // تأكيد النجاح أو إرجاع الرد كما هو:
    // if (!res.ok) {
    //   return NextResponse.json({ error: data }, { status: res.status });
    // }

    // مؤقتاً للتجربة فقط:
    const data = {
      id: orderId,
      status: 'COMPLETED',
      purchase_units: [],
      payer: {},
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error('PayPal capture error:', err);
    return NextResponse.json({ error: 'Capture failed' }, { status: 500 });
  }
}
