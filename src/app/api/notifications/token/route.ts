/**
 * FCM Token Storage API Route
 * Stores FCM tokens for users to send push notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, userId, userEmail, userType } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json({
        success: true,
        message: 'Token stored (simulated)',
      });
    }

    try {
      // Check if token already exists
      const tokensCollection = collection(db, 'fcm_tokens');
      const q = query(
        tokensCollection,
        where('token', '==', token)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Update existing token
        const tokenDoc = querySnapshot.docs[0];
        await updateDoc(tokenDoc.ref, {
          userId,
          userEmail,
          userType,
          updatedAt: serverTimestamp(),
          active: true,
        });

        return NextResponse.json({
          success: true,
          message: 'Token updated',
          tokenId: tokenDoc.id,
        });
      } else {
        // Create new token
        const docRef = await addDoc(tokensCollection, {
          token,
          userId,
          userEmail,
          userType: userType || 'customer',
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return NextResponse.json({
          success: true,
          message: 'Token stored',
          tokenId: docRef.id,
        });
      }
    } catch (error: any) {
      console.error('Error storing FCM token:', error);
      return NextResponse.json(
        { error: 'Failed to store token', details: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in token storage API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}






