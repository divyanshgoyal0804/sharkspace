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
    await connectDB();
    
    const rawData = await request.json();
    const sanitizedData = sanitizeObject(rawData);
    
    // Validate input
    const usernameValidation = validateUsername(sanitizedData.username);
    if (!usernameValidation.success) {
      return Response.json({ error: usernameValidation.error }, { status: 400 });
    }
    
    const passwordValidation = validatePassword(sanitizedData.password);
    if (!passwordValidation.success) {
      return Response.json({ error: passwordValidation.error }, { status: 400 });
    }
    
    const roleValidation = validateRole(sanitizedData.role);
    if (!roleValidation.success) {
      return Response.json({ error: roleValidation.error }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers = await storage.getUsers();
    const userExists = existingUsers.some(u => u.username === usernameValidation.data);

    if (userExists) {
      return Response.json({ error: 'Username already exists' }, { status: 409 });
    }
    
    // Hash the password before storing
    const hashedPassword = hashPassword(passwordValidation.data!);
    const userWithHashedPassword = {
      ...sanitizedData,
      username: usernameValidation.data!,
      password: hashedPassword,
      role: roleValidation.data!,
      id: uuidv4(),
      createdAt: new Date(),
    };
    
    await storage.addUser(userWithHashedPassword);
    
    // Return user without password
    const { password, ...safeUser } = userWithHashedPassword;
    return Response.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
