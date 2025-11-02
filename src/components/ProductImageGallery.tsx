'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight, Package, AlertCircle } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  discount?: string;
  stock?: number;
  outOfStock?: boolean;
  lowStockThreshold?: number;
}

export default function ProductImageGallery({
  images,
  productName,
  discount,
  stock,
  outOfStock,
  lowStockThreshold = 10
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 md:p-16 h-[400px] md:h-[500px] flex items-center justify-center">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold">
          {productName.charAt(0)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image with Zoom */}
      <div className="relative group bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
        <div
          className="relative h-[400px] md:h-[500px] cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <motion.img
            key={selectedIndex}
            src={images[selectedIndex]}
            alt={`${productName} - صورة ${selectedIndex + 1}`}
            className="w-full h-full object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              transform: isZoomed
                ? `scale(2) translate(${-zoomPosition.x * 2 + 50}%, ${-zoomPosition.y * 2 + 50}%)`
                : 'scale(1)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              transition: 'transform 0.1s ease-out'
            }}
          />

          {/* Zoom Indicator */}
          {!isZoomed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm backdrop-blur-sm"
            >
              <ZoomIn className="w-4 h-4" />
              <span>اضغط للتكبير</span>
            </motion.div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Discount Badge */}
          {discount && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg z-10">
              خصم {discount}
            </div>
          )}

          {/* Stock Status */}
          {stock !== undefined && (
            <div className="absolute bottom-4 right-4 z-10">
              {outOfStock || stock <= 0 ? (
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg">
                  <X className="w-4 h-4" />
                  نفد من المخزون
                </div>
              ) : stock <= lowStockThreshold ? (
                <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg">
                  <AlertCircle className="w-4 h-4" />
                  آخر {stock} قطعة
                </div>
              ) : (
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg">
                  <Package className="w-4 h-4" />
                  متوفر ({stock})
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={img}
                alt={`${productName} - صورة مصغرة ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              src={images[selectedIndex]}
              alt={`${productName} - صورة مكبرة`}
              className="max-w-full max-h-[90vh] object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

