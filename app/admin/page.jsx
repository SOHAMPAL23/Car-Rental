"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { isAdminRole } from '@/lib/roles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Car, Calendar, Plus, Trash2, Edit, Check, X, Loader2 } from 'lucide-react'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
}

export default function AdminPage() {
  const router = useRouter()
  const { user, token, loading: authLoading } = useAuth()
  const [cars, setCars] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddingCar, setIsAddingCar] = useState(false)
  const [addCarLoading, setAddCarLoading] = useState(false)
  const [newCar, setNewCar] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price_per_day: '',
    image_url: '',
    description: ''
  })

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdminRole(user.role)) {
        router.push('/')
      } else {
        fetchData()
      }
    }
  }, [user, authLoading, router])

  const fetchData = async () => {
    try {
      const [carsRes, bookingsRes] = await Promise.all([
        fetch('/api/cars'),
        fetch('/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])
      
      const carsData = await carsRes.json()
      const bookingsData = await bookingsRes.json()
      
      setCars(carsData.cars || [])
      setBookings(bookingsData.bookings || [])
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCar = async (e) => {
    e.preventDefault()
    setAddCarLoading(true)
    setError('')

    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCar)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setNewCar({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        price_per_day: '',
        image_url: '',
        description: ''
      })
      setIsAddingCar(false)
      fetchData()
    } catch (err) {
      setError(err.message)
    } finally {
      setAddCarLoading(false)
    }
  }

  const deleteCar = async (carId) => {
    if (!confirm('Are you sure you want to delete this car?')) return

    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage cars and bookings</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="cars">
        <TabsList className="mb-6">
          <TabsTrigger value="cars" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Cars ({cars.length})
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Bookings ({bookings.length})
          </TabsTrigger>
        </TabsList>

        {/* Cars Tab */}
        <TabsContent value="cars">
          <div className="flex justify-end mb-4">
            <Dialog open={isAddingCar} onOpenChange={setIsAddingCar}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Car
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Car</DialogTitle>
                  <DialogDescription>Fill in the details to add a new car to the fleet</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCar}>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={newCar.brand}
                          onChange={(e) => setNewCar({...newCar, brand: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <Input
                          id="model"
                          value={newCar.model}
                          onChange={(e) => setNewCar({...newCar, model: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          type="number"
                          value={newCar.year}
                          onChange={(e) => setNewCar({...newCar, year: parseInt(e.target.value)})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price per Day ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newCar.price_per_day}
                          onChange={(e) => setNewCar({...newCar, price_per_day: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        type="url"
                        value={newCar.image_url}
                        onChange={(e) => setNewCar({...newCar, image_url: e.target.value})}
                        placeholder="https://example.com/car-image.jpg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newCar.description}
                        onChange={(e) => setNewCar({...newCar, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddingCar(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addCarLoading}>
                      {addCarLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Car'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {cars.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No cars in the fleet yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {cars.map(car => (
                <Card key={car.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        {car.image_url ? (
                          <img src={car.image_url} alt={car.brand} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{car.brand} {car.model} ({car.year})</h3>
                        <p className="text-sm text-muted-foreground">${car.price_per_day}/day</p>
                      </div>
                      <Badge variant={car.available ? "default" : "secondary"}>
                        {car.available ? "Available" : "Unavailable"}
                      </Badge>
                      <Button variant="outline" size="icon" onClick={() => deleteCar(car.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bookings yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{booking.brand} {booking.model}</h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.user_name} ({booking.user_email})
                        </p>
                        <p className="text-sm">
                          {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-semibold text-primary">${booking.total_price}</p>
                      </div>
                      <Badge className={statusColors[booking.status]}>
                        {booking.status}
                      </Badge>
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button 
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
