import Link from 'next/link';
import { BookOpen, Home, Search } from 'lucide-react';

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            المقال غير موجود
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            عذراً، لا يمكننا العثور على المقال الذي تبحث عنه.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-gray-400">
            قد يكون المقال قد حُذف أو تم تغيير رابطه أو أنه غير متوفر مؤقتاً.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/blog"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
          >
            <BookOpen className="w-5 h-5" />
            تصفح المدونة
          </Link>
          <Link
            href="/"
            className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 border border-white/10 shadow-lg"
          >
            <Home className="w-5 h-5" />
            الصفحة الرئيسية
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          يمكنك البحث عن مقالات أخرى أو العودة إلى الصفحة الرئيسية.
        </p>
      </div>
    </div>
  );
}
