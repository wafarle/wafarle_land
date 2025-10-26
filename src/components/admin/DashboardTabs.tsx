'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Package, 
  MessageSquare, 
  Settings,
  BarChart3,
  Target,
  Activity,
  Calendar,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Shield,
  Home,
  Sparkles,
  Crown,
  Award,
  Globe,
  Database,
  Layers,
  PieChart,
  LineChart,
  BarChart,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Eye,
  DollarSign
} from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';

// Overview Tab Component
export const OverviewTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">نظرة عامة</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          الإحصائيات الأخيرة
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/70">المبيعات اليوم</span>
            <span className="text-white font-semibold">$2,450</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">الطلبات الجديدة</span>
            <span className="text-white font-semibold">23</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">العملاء النشطين</span>
            <span className="text-white font-semibold">1,234</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          النشاط الأخير
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span className="text-white/70 text-sm">طلب جديد من أحمد محمد</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-white/70 text-sm">دفعة مستلمة بقيمة $99</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-white/70 text-sm">تحديث منتج Netflix</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Analytics Tab Component
export const AnalyticsTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">التحليلات</h2>
    <p className="text-white/60 text-lg">لوحة التحليلات قريباً...</p>
  </div>
);

// Customers Tab Component
export const CustomersTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">العملاء</h2>
    <p className="text-white/60 text-lg">إدارة العملاء قريباً...</p>
  </div>
);

// Orders Tab Component
export const OrdersTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">الطلبات</h2>
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">الطلبات الأخيرة</h3>
        <button className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
          عرض الكل
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AM</span>
            </div>
            <div>
              <p className="text-white font-medium">أحمد محمد</p>
              <p className="text-white/60 text-sm">Netflix Premium</p>
            </div>
          </div>
          <div className="text-right">
            <CurrencyDisplay price={12.99} originalCurrency="USD" className="text-white font-semibold" />
            <p className="text-white/60 text-sm">منذ 5 دقائق</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <div>
              <p className="text-white font-medium">سارة أحمد</p>
              <p className="text-white/60 text-sm">Spotify Premium</p>
            </div>
          </div>
          <div className="text-right">
            <CurrencyDisplay price={9.99} originalCurrency="USD" className="text-white font-semibold" />
            <p className="text-white/60 text-sm">منذ 15 دقيقة</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Messages Tab Component
export const MessagesTab = ({ notifications }: { notifications: any[] }) => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">الرسائل</h2>
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className={`w-3 h-3 rounded-full mt-2 ${
              notification.type === 'success' ? 'bg-emerald-400' :
              notification.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
            }`}></div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">{notification.title}</h3>
              <p className="text-white/70 mb-2">{notification.message}</p>
              <p className="text-white/50 text-sm">{notification.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Settings Tab Component
export const SettingsTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">الإعدادات</h2>
    <p className="text-white/60 text-lg">لوحة الإعدادات قريباً...</p>
  </div>
);

// Reports Tab Component
export const ReportsTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">التقارير</h2>
    <p className="text-white/60 text-lg">التقارير قريباً...</p>
  </div>
);

// Users Tab Component
export const UsersTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">المستخدمين</h2>
    <p className="text-white/60 text-lg">إدارة المستخدمين قريباً...</p>
  </div>
);
