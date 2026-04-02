import { sql, hasDatabase } from '@/lib/db'
import { findDevUserByEmail } from '@/lib/dev-store'
import { verifyPassword, createToken } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    let user
    if (hasDatabase) {
      const users = await sql`SELECT * FROM users WHERE email = ${normalizedEmail}`
      user = users[0]
    } else {
      user = await findDevUserByEmail(normalizedEmail)
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create token
    const token = await createToken({ userId: user.id, email: user.email, role: user.role })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Login error:', error)

    const message =
      error?.message?.includes('Database connection is not configured')
        ? error.message
        : 'Failed to login'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
