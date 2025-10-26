import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyADXAZf6_DAgya_HcwRYQvNxo1lUFu4LqE",
  authDomain: "wafarle-63a71.firebaseapp.com",
  projectId: "wafarle-63a71",
  storageBucket: "wafarle-63a71.firebasestorage.app",
  messagingSenderId: "234030784195",
  appId: "1:234030784195:web:fef98ef416f0c1bc388c76",
  measurementId: "G-LH9ZENFJPY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics only in browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  externalLink: string;
  description?: string;
  createdAt: Date;
  category?: string;
  discount?: string;
  rating?: number;
  features?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  message: string;
  rating: number;
  avatar?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}
