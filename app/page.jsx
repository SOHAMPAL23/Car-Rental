"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Car, Shield, Clock, CreditCard } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Car,
      title: 'Wide Selection',
      description: 'Choose from our extensive fleet of vehicles for any occasion'
    },
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Safe and encrypted transactions for your peace of mind'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer service whenever you need help'
    },
    {
      icon: CreditCard,
      title: 'Best Prices',
      description: 'Competitive rates with no hidden fees or surprises'
    }
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Find Your Perfect
            <span className="text-primary block">Rental Car</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover the freedom of the open road with our premium selection of vehicles. 
            Easy booking, competitive prices, and exceptional service.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/cars">
              <Button size="lg" className="text-lg px-8">
                Browse Cars
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Choose CarRental?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-lg bg-background border border-border hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Hit the Road?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of satisfied customers who trust us for their car rental needs.
          </p>
          <Link href="/cars">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              View Available Cars
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
