import { sql, hasDatabase } from '@/lib/db'
import { createDevBooking, getDevCar, listDevBookings } from '@/lib/dev-store'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { isAdminRole } from '@/lib/roles'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    let bookings
    if (hasDatabase && isAdminRole(payload.role)) {
      bookings = await sql`
        SELECT b.*, c.brand, c.model, c.image_url, u.name as user_name, u.email as user_email
        FROM bookings b
        JOIN cars c ON b.car_id = c.id
        JOIN users u ON b.user_id = u.id
        ORDER BY b.created_at DESC
      `
    } else if (hasDatabase) {
      bookings = await sql`
        SELECT b.*, c.brand, c.model, c.image_url
        FROM bookings b
        JOIN cars c ON b.car_id = c.id
        WHERE b.user_id = ${payload.userId}
        ORDER BY b.created_at DESC
      `
    } else {
      bookings = await listDevBookings({ userId: payload.userId, role: payload.role })
    }

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { car_id, start_date, end_date } = await request.json()

    if (!car_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Car ID, start date and end date are required' },
        { status: 400 }
      )
    }

    if (hasDatabase) {
      // Check if car exists and is available
      const cars = await sql`SELECT * FROM cars WHERE id = ${car_id}`
      if (cars.length === 0) {
        return NextResponse.json({ error: 'Car not found' }, { status: 404 })
      }

      const car = cars[0]
      if (!car.available) {
        return NextResponse.json({ error: 'Car is not available' }, { status: 400 })
      }

      // Check for conflicting bookings
      const conflicts = await sql`
        SELECT id FROM bookings 
        WHERE car_id = ${car_id} 
        AND status != 'cancelled'
        AND (
          (start_date <= ${end_date} AND end_date >= ${start_date})
        )
      `

      if (conflicts.length > 0) {
        return NextResponse.json(
          { error: 'Car is already booked for these dates' },
          { status: 400 }
        )
      }

      // Calculate total price
      const start = new Date(start_date)
      const end = new Date(end_date)
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      const total_price = days * parseFloat(car.price_per_day)

      const result = await sql`
        INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price)
        VALUES (${payload.userId}, ${car_id}, ${start_date}, ${end_date}, ${total_price})
        RETURNING *
      `

      return NextResponse.json({ booking: result[0] }, { status: 201 })
    }

    const car = await getDevCar(car_id)
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }

    const booking = await createDevBooking({
      userId: payload.userId,
      carId: car_id,
      startDate: start_date,
      endDate: end_date,
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('Create booking error:', error)

    if (
      error?.message === 'Car not found' ||
      error?.message === 'Car is not available' ||
      error?.message === 'Car is already booked for these dates'
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Car not found' ? 404 : 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
