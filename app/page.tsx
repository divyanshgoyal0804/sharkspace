'use client';

import { motion } from 'framer-motion';
import LoginForm from '@/components/LoginForm';
import ThemeToggle from '@/components/ui/ThemeToggle';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 transition-all duration-500">
      {/* Header with Theme Toggle */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </div>
      
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 dark:from-blue-600/30 dark:to-indigo-600/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 25, repeat: Infinity, delay: 5 }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-r from-indigo-400/25 to-blue-500/25 dark:from-indigo-600/40 dark:to-blue-600/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 30, repeat: Infinity, delay: 10 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-indigo-400/20 dark:from-cyan-600/30 dark:via-blue-600/30 dark:to-indigo-600/30 rounded-full blur-3xl"
        />
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => {
          // Static positions to avoid hydration mismatch
          const positions = [
            { left: 15, top: 25 }, { left: 85, top: 15 }, { left: 45, top: 75 },
            { left: 70, top: 50 }, { left: 20, top: 80 }, { left: 90, top: 35 },
            { left: 35, top: 10 }, { left: 65, top: 90 }, { left: 10, top: 45 },
            { left: 80, top: 70 }, { left: 55, top: 30 }, { left: 25, top: 60 }
          ];
          
          return (
            <motion.div
              key={i}
              className={`absolute ${
                i % 3 === 0 ? 'border border-blue-300/20 dark:border-blue-400/30 rounded-full' :
                i % 3 === 1 ? 'bg-gradient-to-r from-blue-200/10 to-indigo-200/10 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg' :
                'bg-gradient-to-r from-indigo-200/10 to-cyan-200/10 dark:from-indigo-500/10 dark:to-cyan-500/10 rounded-xl'
              }`}
              animate={{
                x: [0, 150 + i * 8, 0],
                y: [0, -120 - i * 4, 0],
                rotate: [0, 360],
                scale: [1, 1.4, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 18 + i * 2,
                repeat: Infinity,
                delay: i * 1.2,
                ease: "easeInOut",
              }}
              style={{
                left: `${positions[i].left}%`,
                top: `${positions[i].top}%`,
                width: `${25 + i * 3}px`,
                height: `${25 + i * 3}px`,
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute top-8 right-8"
        >
         {/* <ThemeToggle /> */}
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-16 items-center min-h-screen py-12"
        >
          {/* Left side - Hero content */}
          <motion.div variants={itemVariants} className="text-center lg:text-left">
            <motion.h1 
              className="text-6xl lg:text-8xl font-black mb-8 leading-tight"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.span 
                className="block bg-gradient-to-r from-gray-800 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Welcome to
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent mt-2"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                SharkSpace
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-12 leading-relaxed max-w-2xl transition-colors duration-300"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.span
                animate={{ color: ['#374151', '#2563eb', '#374151'] }}
                className="dark:text-gray-300"
                transition={{ duration: 4, repeat: Infinity }}
              >
                Experience the future of coworking
              </motion.span>
              {' '}in Noida's most innovative workspace.
            </motion.p>
          </motion.div>
          
          {/* Right side - Login form */}
          <motion.div variants={itemVariants}>
            <LoginForm />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}