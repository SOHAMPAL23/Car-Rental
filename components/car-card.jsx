"use client"

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign } from 'lucide-react'

export function CarCard({ car }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted relative">
        {car.image_url ? (
          <img
            src={car.image_url}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        <Badge 
          className="absolute top-2 right-2"
          variant={car.available ? "default" : "secondary"}
        >
          {car.available ? "Available" : "Unavailable"}
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{car.brand} {car.model}</span>
          <span className="text-sm text-muted-foreground">{car.year}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-2">
        {car.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {car.description}
          </p>
        )}
        <div className="flex items-center gap-1 text-primary font-semibold">
          <DollarSign className="h-4 w-4" />
          <span>{car.price_per_day}/day</span>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/cars/${car.id}`} className="w-full">
          <Button className="w-full" disabled={!car.available}>
            <Calendar className="h-4 w-4 mr-2" />
            {car.available ? "Book Now" : "Not Available"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
