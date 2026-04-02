"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, DollarSign, Loader2 } from 'lucide-react'

export function BookingForm({ car }) {
  const router = useRouter()
  const { user, token } = useAuth()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return days > 0 ? days * parseFloat(car.price_per_day) : 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!user) {
      router.push('/login')
      return
    }

    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      setError('End date must be after start date')
      return
    }

    if (start < new Date().setHours(0, 0, 0, 0)) {
      setError('Start date cannot be in the past')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          car_id: car.id,
          start_date: startDate,
          end_date: endDate
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      router.push('/bookings')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const total = calculateTotal()
  const days = total > 0 ? Math.ceil(total / parseFloat(car.price_per_day)) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book This Car
        </CardTitle>
        <CardDescription>
          Select your rental dates to proceed with booking
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {total > 0 && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Rate</span>
                <span>${car.price_per_day}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Duration</span>
                <span>{days} day{days > 1 ? 's' : ''}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="flex items-center gap-1 text-primary">
                  <DollarSign className="h-4 w-4" />
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !car.available}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : user ? (
              'Confirm Booking'
            ) : (
              'Login to Book'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
