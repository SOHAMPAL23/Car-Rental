"use client"

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { BookingForm } from '@/components/booking-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, Calendar, DollarSign, Car } from 'lucide-react'

export default function CarDetailPage({ params }) {
  const { id } = use(params)
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCar()
  }, [id])

  const fetchCar = async () => {
    try {
      const res = await fetch(`/api/cars/${id}`)
      const data = await res.json()
      setCar(data.car)
    } catch (error) {
      console.error('Failed to fetch car:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Car Not Found</h1>
        <Link href="/cars">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cars
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/cars" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Cars
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Car Details */}
        <div className="lg:col-span-2">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-6">
            {car.image_url ? (
              <img
                src={car.image_url}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {car.brand} {car.model}
              </h1>
              <p className="text-muted-foreground">{car.year}</p>
            </div>
            <Badge variant={car.available ? "default" : "secondary"} className="text-sm">
              {car.available ? "Available" : "Unavailable"}
            </Badge>
          </div>

          <div className="flex items-center gap-1 text-2xl font-semibold text-primary mb-6">
            <DollarSign className="h-6 w-6" />
            <span>{car.price_per_day}</span>
            <span className="text-sm font-normal text-muted-foreground">/day</span>
          </div>

          {car.description && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{car.description}</p>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <BookingForm car={car} />
          </div>
        </div>
      </div>
    </div>
  )
}
