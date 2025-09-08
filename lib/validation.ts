// lib/validation.ts
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Basic validation functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username: string, role?: string): ValidationResult<string> {
  if (!username || typeof username !== 'string') {
    return { success: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 50) {
    return { success: false, error: 'Username must be less than 50 characters' };
  }
  
  // Allow @ symbol for client users, but restrict admin usernames
  if (role === 'admin') {
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { success: false, error: 'Admin username can only contain letters, numbers, and underscores' };
    }
  } else {
    // For client users, allow @ symbol (useful for email-like usernames)
    if (!/^[a-zA-Z0-9_@.]+$/.test(username)) {
      return { success: false, error: 'Username can only contain letters, numbers, underscores, @ and periods' };
    }
  }
  
  return { success: true, data: username.trim() };
}

export function validatePassword(password: string): ValidationResult<string> {
  if (!password || typeof password !== 'string') {
    return { success: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }
  
  if (password.length > 128) {
    return { success: false, error: 'Password must be less than 128 characters' };
  }
  
  return { success: true, data: password };
}

export function validateRole(role: string): ValidationResult<'client' | 'admin'> {
  if (!role || typeof role !== 'string') {
    return { success: true, data: 'client' }; // Default to client
  }
  
  if (role !== 'client' && role !== 'admin') {
    return { success: false, error: 'Role must be either "client" or "admin"' };
  }
  
  return { success: true, data: role as 'client' | 'admin' };
}

export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function validateLoginData(data: any): ValidationResult<{ username: string; password: string }> {
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Invalid request data' };
  }
  
  // For login, allow flexible username format since we don't know the role yet
  const usernameValidation = validateUsername(data.username, 'client');
  if (!usernameValidation.success) {
    return { success: false, error: usernameValidation.error };
  }
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.success) {
    return { success: false, error: passwordValidation.error };
  }
  
  return {
    success: true,
    data: {
      username: usernameValidation.data!,
      password: passwordValidation.data!
    }
  };
}

export function validateBookingData(data: any): ValidationResult<{
  roomId: string;
  startTime: string;
  endTime: string;
  userId?: string;
  username?: string;
}> {
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Invalid booking data' };
  }
  
  if (!data.roomId || typeof data.roomId !== 'string') {
    return { success: false, error: 'Room ID is required' };
  }
  
  if (!data.startTime || typeof data.startTime !== 'string') {
    return { success: false, error: 'Start time is required' };
  }
  
  if (!data.endTime || typeof data.endTime !== 'string') {
    return { success: false, error: 'End time is required' };
  }
  
  // Validate date formats
  const startDate = new Date(data.startTime);
  const endDate = new Date(data.endTime);
  
  if (isNaN(startDate.getTime())) {
    return { success: false, error: 'Invalid start time format' };
  }
  
  if (isNaN(endDate.getTime())) {
    return { success: false, error: 'Invalid end time format' };
  }
  
  if (endDate <= startDate) {
    return { success: false, error: 'End time must be after start time' };
  }
  
  return {
    success: true,
    data: {
      roomId: data.roomId,
      startTime: data.startTime,
      endTime: data.endTime,
      userId: data.userId,
      username: data.username
    }
  };
}
