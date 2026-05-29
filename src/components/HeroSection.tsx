import React from 'react';
import { motion } from 'motion/react';

export function HeroSection() {
  const handleContactClick = () => {
    window.open('https://abhiraj-profile.vercel.app/', '_blank');
  };

  return (
    <div className="relative w-full max-w-[1400px] mx-auto rounded-[48px] bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 border border-slate-200/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] overflow-hidden h-[600px] flex flex-col">
      {/* Background Video with Fallback */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 transition-transform duration-1000"
          onError={(e) => console.error('Video failed to load:', e)}
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Hero Text Content */}
      <div className="relative z-20 flex-1 px-8 md:px-16 pt-12 md:pt-16 flex flex-col items-start justify-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-4"
        >
          <h1
            className="font-display text-[42px] md:text-[56px] font-semibold text-white leading-[1.05] tracking-tight"
            dangerouslySetInnerHTML={{ __html: 'Master Data Structures<br />& Algorithms' }}
          />

          <p className="font-sans text-[14px] md:text-[15px] text-blue-100 leading-relaxed max-w-lg mt-2">
            Track your progress, explore company-specific interview questions, and level up your coding skills with our comprehensive practice platform.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContactClick}
            className="mt-4 bg-white text-blue-700 rounded-full px-6 py-3 text-[14px] font-semibold hover:shadow-lg transition-all cursor-pointer hover:bg-blue-50"
          >
            Meet the Developer
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
