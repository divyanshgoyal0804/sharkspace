
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ui/ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const headerVariants = {
  initial: { y: -100, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

export default function Layout({ children, title }: LayoutProps) {
  const handleLogout = () => {
    // Add a smooth transition effect before logout
    document.body.style.opacity = '0.5';
    setTimeout(() => {
      localStorage.clear();
      window.location.href = '/';
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/50 dark:to-purple-950/50 transition-all duration-500 relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity, delay: 5 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [-20, 20, -20],
            y: [-10, 10, -10],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 30, repeat: Infinity, delay: 10 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 rounded-full blur-3xl"
        />
      </div>

      <motion.header
        variants={headerVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <motion.div 
                  className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-2xl overflow-hidden"
                  whileHover={{ 
                    scale: 1.1, 
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    rotate: [0, 5, -5, 0]
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-xl" />
                  <motion.i 
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      repeatDelay: 2,
                      ease: "easeInOut"
                    }}
                    className="ri-building-4-line text-white text-xl relative z-10 drop-shadow-lg"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-white/20 rounded-xl"
                  />
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:via-pink-600 group-hover:to-blue-600 transition-all duration-500"
                    whileHover={{ scale: 1.02 }}
                  >
                    SharkSpace
                  </motion.h1>
                  <motion.p 
                    className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300"
                    initial={{ opacity: 0.7 }}
                    whileHover={{ opacity: 1 }}
                  >
                    Premium Coworking • Noida
                  </motion.p>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-6">
              <ThemeToggle />
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  y: -2,
                  boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="group relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <motion.i 
                  className="ri-logout-box-r-line relative z-10"
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.2 }}
                />
                <span className="relative z-10">Logout</span>
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-white/30 rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8"
          >
            <motion.h2 
              className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {title}
            </motion.h2>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            />
          </motion.div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="relative"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Enhanced floating particles background effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 3 === 0 ? 'bg-blue-400/10 dark:bg-blue-400/20' :
              i % 3 === 1 ? 'bg-purple-400/10 dark:bg-purple-400/20' :
              'bg-pink-400/10 dark:bg-pink-400/20'
            }`}
            animate={{
              x: [0, 150 + i * 10, 0],
              y: [0, -120 - i * 5, 0],
              scale: [1, 1.5 + i * 0.1, 1],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut",
            }}
            style={{
              left: `${5 + i * 8}%`,
              top: `${10 + i * 7}%`,
              width: `${20 + i * 4}px`,
              height: `${20 + i * 4}px`,
            }}
          />
        ))}
        
        {/* Floating geometric shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`geo-${i}`}
            className={`absolute border ${
              i % 2 === 0 ? 'border-blue-300/20 dark:border-blue-400/30' : 'border-purple-300/20 dark:border-purple-400/30'
            } ${i % 3 === 0 ? 'rounded-full' : 'rounded-lg'}`}
            animate={{
              x: [0, 100, 0],
              y: [0, -80, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20 + i * 2,
              repeat: Infinity,
              delay: i * 3,
              ease: "linear",
            }}
            style={{
              left: `${70 + i * 5}%`,
              top: `${60 + i * 6}%`,
              width: `${30 + i * 5}px`,
              height: `${30 + i * 5}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
