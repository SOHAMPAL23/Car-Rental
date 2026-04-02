import { sql, hasDatabase } from '@/lib/db'
import { deleteDevCar, getDevCar, updateDevCar } from '@/lib/dev-store'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { isAdminRole } from '@/lib/roles'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const car = hasDatabase
      ? (await sql`SELECT * FROM cars WHERE id = ${id}`)[0]
      : await getDevCar(id)

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }

    return NextResponse.json({ car })
  } catch (error) {
    console.error('Get car error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch car' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
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
    const { brand, model, year, price_per_day, image_url, description, available } = await request.json()

    const car = hasDatabase
      ? (await sql`
          UPDATE cars 
          SET brand = COALESCE(${brand}, brand),
              model = COALESCE(${model}, model),
              year = COALESCE(${year}, year),
              price_per_day = COALESCE(${price_per_day}, price_per_day),
              image_url = COALESCE(${image_url}, image_url),
              description = COALESCE(${description}, description),
              available = COALESCE(${available}, available)
          WHERE id = ${id}
          RETURNING *
        `)[0]
      : await updateDevCar(id, { brand, model, year, price_per_day, image_url, description, available })

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }

    return NextResponse.json({ car })
  } catch (error) {
    console.error('Update car error:', error)
    return NextResponse.json(
      { error: 'Failed to update car' },
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
      ? (await sql`DELETE FROM cars WHERE id = ${id} RETURNING id`).length > 0
      : await deleteDevCar(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Car deleted successfully' })
  } catch (error) {
    console.error('Delete car error:', error)
    return NextResponse.json(
      { error: 'Failed to delete car' },
      { status: 500 }
    )
  }
}
