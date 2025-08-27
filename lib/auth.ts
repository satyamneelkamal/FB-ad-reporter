/**
 * Authentication Utilities
 * 
 * JWT-based authentication for admin users
 * Password hashing and verification using bcryptjs
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { db, type Admin, supabase } from './supabase'

const JWT_SECRET = process.env.JWT_SECRET!
const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY || 'admin-setup-123'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export interface JwtPayload {
  adminId?: number
  userId?: string
  email: string
  role: 'admin' | 'client'
  clientId?: number
  iat: number
  exp: number
}

/**
 * Hash password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate JWT token for admin
 */
export function generateToken(admin: Admin): string {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    adminId: admin.id,
    email: admin.email,
    role: 'admin'
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token valid for 7 days
    issuer: 'facebook-ads-dashboard'
  })
}

/**
 * Generate JWT token for client with client context
 */
export function generateClientToken(user: any, clientId: number): string {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: 'client',
    clientId
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token valid for 7 days
    issuer: 'facebook-ads-dashboard'
  })
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

/**
 * Extract admin from request headers or cookies
 */
export async function getAdminFromRequest(request: NextRequest): Promise<Admin | null> {
  try {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization')
    let token: string | undefined

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // Try cookie as fallback
      token = request.cookies.get('auth-token')?.value
    }

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    const admin = await db.getAdminByEmail(payload.email)
    
    return admin
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

/**
 * Admin login
 */
export async function loginAdmin(email: string, password: string): Promise<{ admin: Admin; token: string } | null> {
  try {
    const admin = await db.getAdminByEmail(email)
    if (!admin) {
      return null
    }

    const isValidPassword = await verifyPassword(password, admin.password_hash)
    if (!isValidPassword) {
      return null
    }

    const token = generateToken(admin)
    return { admin, token }
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

/**
 * Create admin user (setup only)
 */
export async function createAdmin(
  email: string, 
  password: string, 
  setupKey: string
): Promise<Admin> {
  // Verify setup key
  if (setupKey !== ADMIN_SETUP_KEY) {
    throw new Error('Invalid setup key')
  }

  // Check if admin already exists
  const existingAdmin = await db.getAdminByEmail(email)
  if (existingAdmin) {
    throw new Error('Admin user already exists')
  }

  // Validate password strength
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  // Hash password and create admin
  const passwordHash = await hashPassword(password)
  
  return db.createAdmin({
    email,
    password_hash: passwordHash
  })
}

/**
 * Middleware helper for protected routes
 */
export function requireAuth() {
  return async (request: NextRequest) => {
    const admin = await getAdminFromRequest(request)
    
    if (!admin) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    return admin
  }
}

/**
 * Extract client ID from JWT token for authenticated clients
 */
export async function getClientIdFromToken(request: NextRequest): Promise<number> {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    const payload = verifyToken(token)
    
    if (payload.role === 'admin') {
      throw new Error('Admin users cannot access client-specific analytics')
    }
    
    if (payload.role === 'client' && payload.clientId) {
      return payload.clientId
    }
    
    // Fallback: lookup client by user_id if clientId not in token
    if (payload.userId) {
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', payload.userId)
        .single()
        
      if (error || !data) {
        throw new Error('Client not found for user')
      }
      
      return data.id
    }
    
    throw new Error('Invalid token structure')
    
  } catch (error) {
    console.error('Error extracting client ID:', error)
    throw new Error('Failed to authenticate client')
  }
}

/**
 * Get client information from token
 */
export async function getClientFromToken(request: NextRequest) {
  try {
    const clientId = await getClientIdFromToken(request)
    
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()
      
    if (error || !client) {
      throw new Error('Client not found')
    }
    
    return client
    
  } catch (error) {
    console.error('Error getting client:', error)
    throw error
  }
}

/**
 * Generate secure cookie options
 */
export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/'
  }
}