import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url))
const dataDirectory = path.join(moduleDirectory, '..', 'data')
const dataFile = path.join(dataDirectory, 'dev-store.json')

const seedStore = {
  users: [
    {
      id: 1,
      name: 'Premium Car Rentals',
      email: 'admin@carrental.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4ezTSCXJq.NuZPKy',
      phone: null,
      role: 'agency',
      created_at: '2026-01-01T00:00:00.000Z'
    }
  ],
  cars: [
    {
      id: 1,
      brand: 'Toyota',
      model: 'Camry',
      year: 2024,
      price_per_day: 65,
      image_url: null,
      description: 'Comfortable midsize sedan with excellent fuel economy.',
      available: true,
      created_at: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      brand: 'Honda',
      model: 'CR-V',
      year: 2023,
      price_per_day: 85,
      image_url: null,
      description: 'Spacious SUV with smooth handling and plenty of cargo room.',
      available: true,
      created_at: '2026-01-02T00:00:00.000Z'
    },
    {
      id: 3,
      brand: 'BMW',
      model: '3 Series',
      year: 2024,
      price_per_day: 120,
      image_url: null,
      description: 'Premium sedan with a responsive drive and upscale cabin.',
      available: true,
      created_at: '2026-01-03T00:00:00.000Z'
    },
    {
      id: 4,
      brand: 'Tesla',
      model: 'Model 3',
      year: 2024,
      price_per_day: 110,
      image_url: null,
      description: 'Modern electric vehicle with quick acceleration and long range.',
      available: true,
      created_at: '2026-01-04T00:00:00.000Z'
    },
    {
      id: 5,
      brand: 'Ford',
      model: 'Mustang',
      year: 2023,
      price_per_day: 95,
      image_url: null,
      description: 'Iconic performance coupe for a more spirited drive.',
      available: true,
      created_at: '2026-01-05T00:00:00.000Z'
    },
    {
      id: 6,
      brand: 'Mercedes',
      model: 'E-Class',
      year: 2024,
      price_per_day: 145,
      image_url: null,
      description: 'Luxury sedan with refined comfort and advanced tech features.',
      available: true,
      created_at: '2026-01-06T00:00:00.000Z'
    }
  ],
  bookings: []
}

function cloneSeedStore() {
  return JSON.parse(JSON.stringify(seedStore))
}

async function readStore() {
  await mkdir(dataDirectory, { recursive: true })

  try {
    const raw = await readFile(dataFile, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }

    const store = cloneSeedStore()
    await writeStore(store)
    return store
  }
}

async function writeStore(store) {
  await mkdir(dataDirectory, { recursive: true })
  await writeFile(dataFile, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
}

function getNextId(items) {
  return items.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1
}

function sortByNewest(items) {
  return [...items].sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  )
}

function sanitizeUser(user) {
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}

function toNumberId(id) {
  return Number.parseInt(String(id), 10)
}

function enrichBooking(booking, store) {
  const car = store.cars.find((item) => item.id === booking.car_id)
  const user = store.users.find((item) => item.id === booking.user_id)

  return {
    ...booking,
    brand: car?.brand ?? null,
    model: car?.model ?? null,
    image_url: car?.image_url ?? null,
    user_name: user?.name ?? null,
    user_email: user?.email ?? null,
  }
}

export async function registerDevUser({ name, email, password, phone }) {
  const store = await readStore()
  const normalizedEmail = email.trim().toLowerCase()

  if (store.users.some((user) => user.email === normalizedEmail)) {
    throw new Error('User with this email already exists')
  }

  const user = {
    id: getNextId(store.users),
    name,
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
    phone: phone || null,
    role: 'customer',
    created_at: new Date().toISOString(),
  }

  store.users.push(user)
  await writeStore(store)

  return sanitizeUser(user)
}

export async function findDevUserByEmail(email) {
  const store = await readStore()
  const normalizedEmail = email.trim().toLowerCase()

  return store.users.find((user) => user.email === normalizedEmail) ?? null
}

export async function listDevCars() {
  const store = await readStore()
  return sortByNewest(store.cars)
}

export async function getDevCar(id) {
  const store = await readStore()
  const carId = toNumberId(id)
  return store.cars.find((car) => car.id === carId) ?? null
}

export async function createDevCar({ brand, model, year, price_per_day, image_url, description }) {
  const store = await readStore()

  const car = {
    id: getNextId(store.cars),
    brand,
    model,
    year: Number(year),
    price_per_day: Number(price_per_day),
    image_url: image_url || null,
    description: description || null,
    available: true,
    created_at: new Date().toISOString(),
  }

  store.cars.push(car)
  await writeStore(store)

  return car
}

export async function updateDevCar(id, updates) {
  const store = await readStore()
  const carId = toNumberId(id)
  const index = store.cars.findIndex((car) => car.id === carId)

  if (index === -1) {
    return null
  }

  const currentCar = store.cars[index]
  const nextCar = {
    ...currentCar,
    ...Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined && value !== null)
    ),
  }

  if (updates.year !== undefined) {
    nextCar.year = Number(updates.year)
  }

  if (updates.price_per_day !== undefined) {
    nextCar.price_per_day = Number(updates.price_per_day)
  }

  store.cars[index] = nextCar
  await writeStore(store)

  return nextCar
}

export async function deleteDevCar(id) {
  const store = await readStore()
  const carId = toNumberId(id)
  const index = store.cars.findIndex((car) => car.id === carId)

  if (index === -1) {
    return false
  }

  store.cars.splice(index, 1)
  store.bookings = store.bookings.filter((booking) => booking.car_id !== carId)
  await writeStore(store)

  return true
}

export async function listDevBookings({ userId, role }) {
  const store = await readStore()
  const bookings = isAdminView(role)
    ? store.bookings
    : store.bookings.filter((booking) => booking.user_id === userId)

  return sortByNewest(bookings.map((booking) => enrichBooking(booking, store)))
}

export async function getDevBooking(id) {
  const store = await readStore()
  const bookingId = toNumberId(id)
  return store.bookings.find((booking) => booking.id === bookingId) ?? null
}

export async function createDevBooking({ userId, carId, startDate, endDate }) {
  const store = await readStore()
  const parsedCarId = toNumberId(carId)
  const car = store.cars.find((item) => item.id === parsedCarId)

  if (!car) {
    throw new Error('Car not found')
  }

  if (!car.available) {
    throw new Error('Car is not available')
  }

  const hasConflict = store.bookings.some((booking) => {
    if (booking.car_id !== parsedCarId || booking.status === 'cancelled') {
      return false
    }

    return booking.start_date <= endDate && booking.end_date >= startDate
  })

  if (hasConflict) {
    throw new Error('Car is already booked for these dates')
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const booking = {
    id: getNextId(store.bookings),
    user_id: userId,
    car_id: parsedCarId,
    start_date: startDate,
    end_date: endDate,
    total_price: days * Number(car.price_per_day),
    status: 'pending',
    created_at: new Date().toISOString(),
  }

  store.bookings.push(booking)
  await writeStore(store)

  return enrichBooking(booking, store)
}

export async function updateDevBookingStatus(id, status) {
  const store = await readStore()
  const bookingId = toNumberId(id)
  const index = store.bookings.findIndex((booking) => booking.id === bookingId)

  if (index === -1) {
    return null
  }

  store.bookings[index] = {
    ...store.bookings[index],
    status,
  }

  await writeStore(store)

  return enrichBooking(store.bookings[index], store)
}

export async function deleteDevBooking(id) {
  const store = await readStore()
  const bookingId = toNumberId(id)
  const index = store.bookings.findIndex((booking) => booking.id === bookingId)

  if (index === -1) {
    return false
  }

  store.bookings.splice(index, 1)
  await writeStore(store)

  return true
}

function isAdminView(role) {
  return role === 'admin' || role === 'agency'
}
