import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const phone = formData.get('phone') as string;
    const avatarFile = formData.get('avatar') as File | null;

    let avatarPath = null;

    if (avatarFile && avatarFile.size > 0) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const filename = `avatar-${userId}-${Date.now()}${path.extname(avatarFile.name)}`;
      
      // Ensure directory exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
      await mkdir(uploadDir, { recursive: true });
      
      await writeFile(path.join(uploadDir, filename), buffer);
      avatarPath = `/uploads/avatars/${filename}`;
    }

    const updateData: any = {};
    if (phone) updateData.phone = phone;
    if (avatarPath) updateData.avatar = avatarPath;

    if (Object.keys(updateData).length > 0) {
        updateData.updated_at = new Date();
        await db('users').where('id', userId).update(updateData);
    }
    
    // Fetch updated user to return
    const updatedUser = await db('users').where('id', userId).select('id', 'name', 'email', 'phone', 'avatar', 'role', 'created_at').first();

    return NextResponse.json({ 
        message: 'Info updated successfully', 
        user: updatedUser 
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
