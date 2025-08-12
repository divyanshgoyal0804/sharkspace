
'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="w-5 h-5 flex items-center justify-center"
      >
        {isDark ? (
          <i className="ri-moon-line text-yellow-500"></i>
        ) : (
          <i className="ri-sun-line text-yellow-500"></i>
        )}
      </motion.div>
    </motion.button>
  );
}
