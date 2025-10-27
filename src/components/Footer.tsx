'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Zap, Youtube, MessageCircle } from 'lucide-react';
import { useSiteName, useContactInfo, useSettings } from '../contexts/SettingsContext';

const Footer = () => {
  const siteName = useSiteName();
  const { email, phone } = useContactInfo();
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();

  // Dynamic social links from settings
  const socialLinks = [
    { 
      icon: Facebook, 
      href: settings.website.socialLinks.facebook, 
      label: 'Facebook', 
      color: 'hover:text-blue-600' 
    },
    { 
      icon: Twitter, 
      href: settings.website.socialLinks.twitter, 
      label: 'Twitter', 
      color: 'hover:text-blue-400' 
    },
    { 
      icon: Instagram, 
      href: settings.website.socialLinks.instagram, 
      label: 'Instagram', 
      color: 'hover:text-pink-600' 
    },
    { 
      icon: Youtube, 
      href: settings.website.socialLinks.youtube, 
      label: 'YouTube', 
      color: 'hover:text-red-500' 
    },
    { 
      icon: Linkedin, 
      href: settings.website.socialLinks.linkedin, 
      label: 'LinkedIn', 
      color: 'hover:text-blue-700' 
    },
    { 
      icon: MessageCircle, 
      href: settings.website.socialLinks.telegram, 
      label: 'Telegram', 
      color: 'hover:text-blue-500' 
    },
  ].filter(link => link.href && link.href.trim() !== ''); // Only show links that have values

  const quickLinks = [
    { name: 'الرئيسية', href: '#home' },
    { name: 'الخدمات', href: '#services' },
    { name: 'المميزات', href: '#features' },
    { name: 'تواصل معنا', href: '#contact' },
  ];

  const serviceLinks = [
    { name: 'Netflix Premium', href: '#services' },
    { name: 'Spotify Premium', href: '#services' },
    { name: 'Shahid VIP', href: '#services' },
    { name: 'Adobe Creative Cloud', href: '#services' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container py-12 md:py-16" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-2xl font-bold">{siteName.split(' - ')[0]}</span>
                <span className="text-xs text-gray-400 -mt-1 hidden md:block">{siteName.split(' - ')[1] || 'wafarle'}</span>
              </div>
            </Link>
            
            <p className="text-sm md:text-base text-gray-300 mb-4 md:mb-6 max-w-md leading-relaxed">
              نوفر لك أفضل العروض والخصومات على جميع خدمات الاشتراكات المفضلة لديك. 
              وفر حتى 70% على اشتراكاتك مع ضمان الجودة والموثوقية.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>الرياض، المملكة العربية السعودية</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">روابط سريعة</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">خدماتنا</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <span className="text-gray-400">تابعنا على:</span>
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-4">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 transition-all duration-300 ${social.color}`}
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="text-gray-400 text-sm">
              © {currentYear} وفرلي. جميع الحقوق محفوظة.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-4">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-white transition-colors duration-300">
                سياسة الخصوصية
              </Link>
              <Link href="#" className="hover:text-white transition-colors duration-300">
                شروط الاستخدام
              </Link>
              <Link href="#" className="hover:text-white transition-colors duration-300">
                سياسة الاسترداد
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <span>صُنع بـ</span>
              <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              <span>في السعودية</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;