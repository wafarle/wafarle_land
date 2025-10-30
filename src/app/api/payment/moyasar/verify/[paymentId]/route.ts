import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { paymentId: string };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> } // <-- التغيير هنا
) {
  const { paymentId } = await params; // <-- ولازم نعمل await

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
  }

  try {
    // مثال: استدعاء تحقق من Moyasar (عدّل حسب منطقك)
    // const res = await fetch(`https://api.moyasar.com/v1/payments/${paymentId}`, {
    //   headers: {
    //     Authorization: `Basic ${Buffer.from(process.env.MOYASAR_SECRET_KEY + ':').toString('base64')}`,
    //   },
    //   cache: 'no-store',
    // });

    // const data = await res.json();
    // return NextResponse.json({
    //   id: data.id,
    //   status: data.status,
    //   amount: data.amount,
    //   currency: data.currency,
    //   metadata: data.metadata ?? {},
    // });

    // مؤقتاً للتجربة
    return NextResponse.json({
      id: paymentId,
      status: 'captured',
      amount: 1000,
      currency: 'SAR',
      metadata: {},
    });
  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
