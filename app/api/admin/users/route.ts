import { NextRequest } from 'next/server';
import { storage, connectDB } from '@/lib/storage';
import { hashPassword } from '@/lib/auth';
import { validateUsername, validatePassword, validateRole, sanitizeObject } from '@/lib/validation';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    // Authentication is handled by middleware
    await connectDB();
    const users = await storage.getUsers();
    
    // Remove password hashes from response for security
    const safeUsers = users.map(({ password, ...user }) => user);
    
    return Response.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/users - Starting user creation');
    await connectDB();
    
    const rawData = await request.json();
    console.log('Received data:', { ...rawData, password: '[HIDDEN]' });
    
    const sanitizedData = sanitizeObject(rawData);
    
    // Validate input
    const usernameValidation = validateUsername(sanitizedData.username);
    if (!usernameValidation.success) {
      console.log('Username validation failed:', usernameValidation.error);
      return Response.json({ error: usernameValidation.error }, { status: 400 });
    }
    
    const passwordValidation = validatePassword(sanitizedData.password);
    if (!passwordValidation.success) {
      console.log('Password validation failed:', passwordValidation.error);
      return Response.json({ error: passwordValidation.error }, { status: 400 });
    }
    
    const roleValidation = validateRole(sanitizedData.role);
    if (!roleValidation.success) {
      console.log('Role validation failed:', roleValidation.error);
      return Response.json({ error: roleValidation.error }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers = await storage.getUsers();
    const userExists = existingUsers.some(u => u.username === usernameValidation.data);

    if (userExists) {
      console.log('User already exists:', usernameValidation.data);
      return Response.json({ error: 'Username already exists' }, { status: 409 });
    }
    
    // Hash the password before storing
    console.log('Hashing password and creating user object');
    const hashedPassword = hashPassword(passwordValidation.data!);
    const userWithHashedPassword = {
      ...sanitizedData,
      username: usernameValidation.data!,
      password: hashedPassword,
      role: roleValidation.data!,
      id: uuidv4(),
      createdAt: new Date(),
    };
    
    console.log('Adding user to storage:', { ...userWithHashedPassword, password: '[HIDDEN]' });
    await storage.addUser(userWithHashedPassword);
    
    // Return user without password
    const { password, ...safeUser } = userWithHashedPassword;
    console.log('User created successfully:', safeUser);
    return Response.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
