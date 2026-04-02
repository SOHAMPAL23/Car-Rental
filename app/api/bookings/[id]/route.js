import { sql, hasDatabase } from '@/lib/db'
import { deleteDevBooking, getDevBooking, updateDevBookingStatus } from '@/lib/dev-store'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { isAdminRole } from '@/lib/roles'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Check if booking exists and user has permission
    const booking = hasDatabase
      ? (await sql`SELECT * FROM bookings WHERE id = ${id}`)[0]
      : await getDevBooking(id)

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Only admin can confirm/complete, user can only cancel their own booking
    if (!isAdminRole(payload.role)) {
      if (booking.user_id !== payload.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      if (status !== 'cancelled') {
        return NextResponse.json(
          { error: 'You can only cancel your booking' },
          { status: 403 }
        )
      }
    }

    const result = hasDatabase
      ? await sql`
          UPDATE bookings SET status = ${status} WHERE id = ${id} RETURNING *
        `
      : [await updateDevBookingStatus(id, status)].filter(Boolean)

    return NextResponse.json({ booking: result[0] })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !isAdminRole(payload.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const deleted = hasDatabase
      ? (await sql`DELETE FROM bookings WHERE id = ${id} RETURNING id`).length > 0
      : await deleteDevBooking(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Booking deleted successfully' })
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}
