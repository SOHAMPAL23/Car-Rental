import { sql, hasDatabase } from '@/lib/db'
import { createDevCar, listDevCars } from '@/lib/dev-store'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { isAdminRole } from '@/lib/roles'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const available = searchParams.get('available')
    const brand = searchParams.get('brand')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const cars = hasDatabase
      ? await sql`SELECT * FROM cars ORDER BY created_at DESC`
      : await listDevCars()
    
    let filteredCars = cars
    if (available === 'true') {
      filteredCars = filteredCars.filter(car => car.available)
    }
    if (brand) {
      filteredCars = filteredCars.filter(car => 
        car.brand.toLowerCase().includes(brand.toLowerCase())
      )
    }
    if (minPrice) {
      filteredCars = filteredCars.filter(car => car.price_per_day >= parseFloat(minPrice))
    }
    if (maxPrice) {
      filteredCars = filteredCars.filter(car => car.price_per_day <= parseFloat(maxPrice))
    }

    return NextResponse.json({ cars: filteredCars })
  } catch (error) {
    console.error('Get cars error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
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
    if (!payload || !isAdminRole(payload.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { brand, model, year, price_per_day, image_url, description } = await request.json()

    if (!brand || !model || !year || !price_per_day) {
      return NextResponse.json(
        { error: 'Brand, model, year and price are required' },
        { status: 400 }
      )
    }

    if (hasDatabase) {
      const result = await sql`
        INSERT INTO cars (brand, model, year, price_per_day, image_url, description)
        VALUES (${brand}, ${model}, ${year}, ${price_per_day}, ${image_url || null}, ${description || null})
        RETURNING *
      `

      return NextResponse.json({ car: result[0] }, { status: 201 })
    }

    const car = await createDevCar({
      brand,
      model,
      year,
      price_per_day,
      image_url,
      description,
    })

    return NextResponse.json({ car }, { status: 201 })
  } catch (error) {
    console.error('Create car error:', error)
    return NextResponse.json(
      { error: 'Failed to create car' },
      { status: 500 }
    )
  }
}
