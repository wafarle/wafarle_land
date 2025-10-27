'use client';

import { motion } from 'framer-motion';
import { Settings, Clock, Wrench, Mail, Phone } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const MaintenanceMode = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-12"
        >
          {/* Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <Settings className="w-16 h-16 text-yellow-400" />
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {settings.website.siteName}
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-yellow-400 mb-6">
            🚧 الموقع تحت الصيانة
          </h2>

          {/* Description */}
          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            نعتذر عن الإزعاج. نقوم حالياً بتحسين الموقع ليقدم لك تجربة أفضل.
            سنعود قريباً بمميزات جديدة ومطورة!
          </p>

          {/* Features being worked on */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 rounded-lg p-4"
            >
              <Wrench className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-white/70 text-sm">تحسين الأداء</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 rounded-lg p-4"
            >
              <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-white/70 text-sm">إضافة مميزات جديدة</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 rounded-lg p-4"
            >
              <Settings className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white/70 text-sm">تحديث النظام</p>
            </motion.div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-white/60 mb-4">
              للاستفسارات العاجلة، يمكنك التواصل معنا:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.a
                href={`mailto:${settings.website.contactEmail}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg text-blue-300 transition-colors"
              >
                <Mail className="w-4 h-4" />
                {settings.website.contactEmail}
              </motion.a>
              
              <motion.a
                href={`tel:${settings.website.contactPhone}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 px-4 py-2 rounded-lg text-green-300 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {settings.website.contactPhone}
              </motion.a>
            </div>
          </div>

          {/* Animated dots */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-3 h-3 bg-yellow-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
