import { sql, hasDatabase } from '@/lib/db'
import { registerDevUser } from '@/lib/dev-store'
import { hashPassword, createToken } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const {
      name: rawName,
      email: rawEmail,
      password,
      phone: rawPhone
    } = await request.json()

    const name = rawName?.trim()
    const email = rawEmail?.trim().toLowerCase()
    const phone = rawPhone?.trim() || null
    const role = 'customer'

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    let user

    if (hasDatabase) {
      // Check if user already exists
      const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`
      if (existingUser.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password)
      const result = await sql`
        INSERT INTO users (name, email, password, phone, role)
        VALUES (${name}, ${email}, ${hashedPassword}, ${phone}, ${role})
        RETURNING id, name, email, phone, role, created_at
      `

      user = result[0]
    } else {
      user = await registerDevUser({ name, email, password, phone })
    }

    const token = await createToken({ userId: user.id, email: user.email, role: user.role })

    return NextResponse.json({
      message: 'User registered successfully',
      user,
      token
    })
  } catch (error) {
    console.error('Registration error:', error)

    if (error?.message === 'User with this email already exists') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    const message =
      error?.message?.includes('Database connection is not configured')
        ? error.message
        : 'Failed to register user'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
