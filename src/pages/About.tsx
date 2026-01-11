import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Trophy, Users, Heart, Target } from 'lucide-react';
import courtAerial from '@/assets/court-aerial.jpg';

export default function About() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={courtAerial}
            alt="PADELit Court"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
        </div>
        <div className="relative z-10 text-center text-primary-foreground">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">About PADELit</h1>
          <p className="text-xl">Like You Mean It</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Our Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Bringing Padel to the Bekaa Region
              </h2>
              <div className="prose prose-lg max-w-none space-y-4 text-foreground">
                <p>
                  Founded in <strong>June 2024</strong> in Barelias, Bekaa, PADELit proudly introduced Padel to the Bekaa region as the very first court to bring this exciting sport to the local community. What started as an outdoor court quickly became a space where people of all ages come together to play, learn, and connect.
                </p>
                <p>
                  At PADELit, our goal is to make Padel accessible to everyone — from beginners discovering the game for the first time to friends and families looking for a fun way to stay active and spend time together. Through community events, friendly matches, and a welcoming atmosphere, PADELit continues to grow the love for padel across the Bekaa region.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-elevated transition-shadow">
              <CardContent className="p-8">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-secondary" />
                <h3 className="text-xl font-bold mb-2">Excellence</h3>
                <p className="text-muted-foreground">
                  Professional-grade facilities and top-notch service
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-elevated transition-shadow">
              <CardContent className="p-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-accent" />
                <h3 className="text-xl font-bold mb-2">Community</h3>
                <p className="text-muted-foreground">
                  Building connections through sport
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-elevated transition-shadow">
              <CardContent className="p-8">
                <Heart className="h-12 w-12 mx-auto mb-4 text-secondary" />
                <h3 className="text-xl font-bold mb-2">Passion</h3>
                <p className="text-muted-foreground">
                  Dedicated to growing the love for padel
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-elevated transition-shadow">
              <CardContent className="p-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-accent" />
                <h3 className="text-xl font-bold mb-2">Accessibility</h3>
                <p className="text-muted-foreground">
                  Making padel available to everyone
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-hero text-primary-foreground">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg mb-8 opacity-90">
              Whether you're a beginner or a seasoned player, there's a place for you at PADELit
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/bookings">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  Book a Court
                </Button>
              </Link>
              <Link to="/tournaments">
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Join a Tournament
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
