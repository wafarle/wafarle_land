'use client';

import { useState, useEffect } from 'react';
import { useSiteName, useContactInfo } from '../contexts/SettingsContext';
import Link from 'next/link';
import { Menu, X, Zap, Phone, Mail, User, LogIn, UserPlus, LogOut, ShoppingCart, Heart, GitCompare, Bell } from 'lucide-react';
import { onCustomerAuthStateChange, signOutCustomer, CustomerUser } from '@/lib/customerAuth';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCompare } from '@/contexts/CompareContext';
import NotificationBell from '@/components/customer/NotificationBell';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const siteName = useSiteName();
  const { phone } = useContactInfo();
  const [isScrolled, setIsScrolled] = useState(false);
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { getTotalItems: getCartItems } = useCart();
  const { getTotalItems: getWishlistItems } = useWishlist();
  const { getTotalItems: getCompareItems } = useCompare();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to customer auth state
  useEffect(() => {
    const unsubscribe = onCustomerAuthStateChange((user) => {
      setCustomerUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOutCustomer();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { name: 'الرئيسية', href: '/' },
    { name: 'المنتجات', href: '/products' },
    { name: 'العروض', href: '/deals' },
    { name: 'المدونة', href: '/blog' },
    { name: 'من نحن', href: '/about' },
    { name: 'تواصل معنا', href: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-transparent'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-0" dir="rtl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Zap className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-bold text-gradient">وفرلي</span>
              <span className="text-xs text-gray-500 -mt-1 hidden md:block">wafarle</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                prefetch={item.href.startsWith('/')}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Contact Info & Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Notification Bell - Only for logged-in users */}
            {customerUser && <NotificationBell />}

            {/* Shopping Icons */}
            <Link
              href="/compare"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="المقارنة"
            >
              <GitCompare className="w-6 h-6 text-gray-700" />
              {getCompareItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {getCompareItems()}
                </span>
              )}
            </Link>

            <Link
              href="/wishlist"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="المفضلة"
            >
              <Heart className="w-6 h-6 text-gray-700" />
              {getWishlistItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {getWishlistItems()}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="السلة"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {getCartItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {getCartItems()}
                </span>
              )}
            </Link>

            {/* Auth Section */}
            {customerUser ? (
              /* User Menu */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {customerUser.displayName || 'حسابي'}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="text-sm font-medium text-gray-900">
                            {customerUser.displayName || 'العميل'}
                          </div>
                          <div className="text-xs text-gray-500">{customerUser.email}</div>
                        </div>
                        
                        <Link
                          href="/customer/dashboard"
                          prefetch
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          لوحة التحكم
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Login/Register Menu in One Icon */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">حسابي</span>
                </button>

                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 overflow-hidden">
                      <div className="py-2">
                        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                          <p className="text-xs text-gray-600">للوصول الكامل</p>
                          <p className="text-sm font-bold text-gray-900">سجل الدخول أو أنشئ حساب</p>
                        </div>

                        <Link
                          href="/auth/login"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LogIn className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">تسجيل الدخول</span>
                        </Link>
                        
                        <Link
                          href="/auth/register"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 transition-colors border-t border-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <UserPlus className="w-5 h-5 text-purple-600" />
                          <span className="font-medium">إنشاء حساب جديد</span>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200">
                {customerUser ? (
                  /* Authenticated User */
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customerUser.displayName || 'العميل'}
                        </div>
                        <div className="text-xs text-gray-500">{customerUser.email}</div>
                      </div>
                    </div>
                    
                    <Link
                      href="/customer/dashboard"
                      prefetch
                      className="flex items-center gap-2 p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      لوحة التحكم
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-right w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                ) : (
                  /* Not Authenticated */
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>{phone}</span>
                    </div>
                    
                    <Link
                      href="/auth/login"
                      prefetch
                      className="flex items-center gap-2 p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4" />
                      تسجيل الدخول
                    </Link>
                    
                    <Link
                      href="/auth/register"
                      prefetch
                      className="flex items-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center justify-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="w-4 h-4" />
                      إنشاء حساب
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;