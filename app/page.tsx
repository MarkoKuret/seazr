import Link from 'next/link';
import Image from 'next/image';
import { BarChart3, Compass, Gauge, Globe, Waves, Router } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSession } from '@/server/auth-action';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className='flex min-h-screen flex-col'>
      {/* Header */}
      <header className='border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur'>
        <div className='container mx-auto flex h-16 max-w-6xl items-center justify-between px-4'>
          <Link
            href='/'
            className='flex items-center gap-2'
            aria-label='Seazr home'
          >
            <div className='relative h-32 w-32'>
              <Image
                src='/logo.svg'
                alt='Seazr Logo'
                width={64}
                height={64}
                className='h-full w-full'
                priority
                unoptimized
              />
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className='hidden items-center gap-8 md:flex'>
            <Link
              href='#features'
              className='hover:text-primary group relative text-sm font-medium transition-colors'
            >
              Features
              <span className='bg-primary absolute -bottom-1 left-0 h-0.5 w-0 transition-all group-hover:w-full'></span>
            </Link>
            <Link
              href='#how-it-works'
              className='hover:text-primary group relative text-sm font-medium transition-colors'
            >
              How It Works
              <span className='bg-primary absolute -bottom-1 left-0 h-0.5 w-0 transition-all group-hover:w-full'></span>
            </Link>
          </nav>

          <Button asChild variant='outline' className='shadow-subtle'>
            <Link href='/login'>Log in</Link>
          </Button>
        </div>
      </header>

      <main className='flex-1'>
        {/* Hero Section */}
        <section className='hero-gradient wave-bottom relative w-full overflow-hidden py-16 md:py-24 lg:py-32'>
          <div className='bg-sea-foam absolute top-1/2 right-0 h-2/3 w-2/3 -translate-y-1/2 transform rounded-full opacity-10 blur-3xl'></div>

          <div className='relative z-10 container mx-auto max-w-6xl px-4 md:px-6'>
            <div className='grid items-center gap-10 lg:grid-cols-2 lg:gap-16'>
              <div className='flex flex-col justify-center space-y-8 p-6 md:p-0'>
                <div className='space-y-6 text-center lg:text-left'>
                  <div className='hidden md:block'>
                    <Badge
                      variant='secondary'
                      className='inline-flex items-center gap-1.5 px-3 py-1 shadow-sm'
                    >
                      <Waves className='h-4 w-4' />
                      Smart Marine Technology
                    </Badge>
                  </div>

                  <h1 className='text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none'>
                    Make Your Boat{' '}
                    <span className='logo-gradient'>Smart</span>{' '}
                  </h1>
                  <p className='text-muted-foreground max-w-[600px] text-lg md:text-xl'>
                    Get real time status using existing sensors into smart IoT
                    devices, giving you a peace of mind from anywhere in the
                    world.
                  </p>
                </div>
                <div className='flex flex-col gap-4 min-[400px]:flex-row'>
                  <Button size='lg' asChild className='shadow-subtle'>
                    <Link href='/signup'>Get Started</Link>
                  </Button>
                  <Button
                    size='lg'
                    variant='outline'
                    asChild
                    className='shadow-sm'
                  >
                    <Link href='#how-it-works'>How It Works</Link>
                  </Button>
                </div>
              </div>
              <div className='flex items-center justify-center lg:justify-end'>
                <div className='relative'>
                  <div
                    className='bg-primary animate-float absolute inset-0 rounded-lg opacity-10 blur-xl'
                    style={{ animationDelay: '1s' }}
                  ></div>
                  <Card className='animate-float border-primary/10 relative rounded-lg bg-white p-1 shadow-xl'>
                    <CardContent className='p-0'>
                      <div className='flex flex-col space-y-4 rounded-md p-6'>
                        <div className='flex items-center space-x-2'>
                          <div className='h-3 w-3 rounded-full bg-red-500'></div>
                          <div className='h-3 w-3 rounded-full bg-yellow-500'></div>
                          <div className='h-3 w-3 rounded-full bg-green-500'></div>
                          <div className='text-muted-foreground ml-auto font-mono text-xs'>
                            Seazr Dashboard
                          </div>
                        </div>
                        <div className='bd-gray rounded-md bg-white p-4 shadow-sm outline-2 outline-blue-100'>
                          <div className='mb-4 flex items-center justify-between'>
                            <div className='text-sm font-bold'>
                              Vessel Status
                            </div>
                            <Badge
                              variant='outline'
                              className='border-green-300 bg-green-100 text-green-800'
                            >
                              Normal
                            </Badge>
                          </div>
                          <div className='grid grid-cols-2 gap-4'>
                            <div className='rounded-md p-3 shadow-sm'>
                              <div className='text-muted-foreground text-xs'>
                                Battery
                              </div>
                              <div className='text-deep-sea text-xl font-bold'>
                                95%
                              </div>
                            </div>
                            <div className='rounded-md p-3 shadow-sm'>
                              <div className='text-muted-foreground text-xs'>
                                Bilge
                              </div>
                              <div className='text-deep-sea text-xl font-bold'>
                                Normal
                              </div>
                            </div>
                            <div className='rounded-md p-3 shadow-sm'>
                              <div className='text-muted-foreground text-xs'>
                                Temperature
                              </div>
                              <div className='text-deep-sea text-xl font-bold'>
                                72°F
                              </div>
                            </div>
                            <div className='rounded-md p-3 shadow-sm'>
                              <div className='text-muted-foreground text-xs'>
                                Humidity
                              </div>
                              <div className='text-deep-sea text-xl font-bold'>
                                45%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id='features'
          className='w-full bg-white py-20 md:py-28 lg:py-32'
        >
          <div className='container mx-auto max-w-6xl px-4 md:px-6'>
            <div className='mx-auto flex max-w-3xl flex-col items-center justify-center space-y-4 text-center'>
              <Badge
                variant='outline'
                className='bg-muted inline-flex items-center rounded-lg px-3 py-1 text-sm'
              >
                <Compass className='text-primary mr-1 h-4 w-4' />
                <span>Smart Marine Technology</span>
              </Badge>
              <h2 className='text-3xl font-bold tracking-tight md:text-4xl'>
                Key Features
              </h2>
              <p className='text-muted-foreground md:text-lg'>
                Seazr transforms your existing boat sensors into a connected
                smart system
              </p>
            </div>

            <div className='mt-16 grid grid-cols-1 gap-8 md:grid-cols-3'>
              {[
                {
                  icon: Globe,
                  title: 'Remote Monitoring',
                  description:
                    "Monitor your boat's vital systems from anywhere in the world using our mobile app or web dashboard.",
                },
                {
                  icon: Gauge,
                  title: 'Legacy Sensor Integration',
                  description:
                    'Works with your existing sensors - no need to replace your current equipment.',
                },
                {
                  icon: BarChart3,
                  title: 'Real-time Alerts',
                  description:
                    'Receive instant notifications about critical issues like Battery levels, bilge pump activity, or security breaches.',
                },
              ].map((feature, index) => (
                <div key={index} className='group relative'>
                  <div className='from-primary/10 to-primary/5 absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 blur-xl transition-opacity group-hover:opacity-100'></div>
                  <Card className='hover:border-primary/20 hover-lift relative h-full bg-white transition-all'>
                    <CardContent className='p-8'>
                      <div className='mb-4'>
                        <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full p-3 shadow-sm'>
                          <feature.icon className='text-primary h-6 w-6' />
                        </div>
                      </div>
                      <h3 className='mb-2 text-xl font-bold'>
                        {feature.title}
                      </h3>
                      <p className='text-muted-foreground flex-grow'>
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id='how-it-works'
          className='bg-secondary relative w-full overflow-hidden py-12 md:py-20 lg:py-28'
        >
          <div className='bg-wave-crest absolute top-0 right-0 h-full w-1/2 rounded-l-full opacity-10'></div>

          <div className='relative z-10 container mx-auto max-w-6xl px-4 md:px-6'>
            <div className='mx-auto flex max-w-3xl flex-col items-center justify-center space-y-3 text-center'>
              <Badge
                variant='outline'
                className='bg-background/80 inline-flex items-center rounded-lg px-3 py-1 text-sm'
              >
                <Compass className='text-primary mr-1 h-4 w-4' />
                <span>Simple 3-Step Process</span>
              </Badge>
              <h2 className='text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl'>
                How Seazr Works
              </h2>
              <p className='text-muted-foreground text-sm md:text-base'>
                Simple installation, powerful results in minutes
              </p>
            </div>

            {/* Mobile View - Vertical Stack */}
            <div className='mt-8 space-y-6 md:hidden'>
              <Card className='hover-lift rounded-xl bg-white p-3 shadow-lg'>
                <div className='relative flex aspect-video items-center justify-center overflow-hidden rounded-lg'>
                  <Router className='text-deep-sea h-24 w-24' />
                  <div className='text-deep-sea absolute top-2 left-2 rounded bg-white/80 px-2 py-1 text-xs font-medium'>
                    Seazr Hub
                  </div>
                </div>
              </Card>

              {[
                {
                  step: 1,
                  title: 'Connect the Seazr Hub',
                  description:
                    'Install our compact hub on your boat. Quick and simple setup.',
                },
                {
                  step: 2,
                  title: 'Pair Your Sensors',
                  description:
                    'Hub automatically detects your existing sensors.',
                },
                {
                  step: 3,
                  title: 'Access Your Dashboard',
                  description:
                    'View boat data in our mobile app or web dashboard.',
                },
              ].map((item, index) => (
                <div key={index} className='relative'>
                  {index > 0 && (
                    <div className='bg-primary/30 absolute -top-3 left-5 h-3 w-0.5'></div>
                  )}
                  <Card className='hover-lift border bg-white shadow-sm'>
                    <CardContent className='flex gap-3 p-4'>
                      <div className='bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-white'>
                        {item.step}
                      </div>
                      <div>
                        <h3 className='text-base font-bold'>{item.title}</h3>
                        <p className='text-muted-foreground mt-1 text-sm'>
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Desktop View - Grid Layout */}
            <div className='mt-12 hidden items-center gap-8 md:grid md:grid-cols-5'>
              <div className='relative md:col-span-2'>
                <Card className='hover-lift relative z-10 rounded-xl bg-white p-4 shadow-lg'>
                  <div className='flex aspect-square items-center justify-center rounded-lg'>
                    <Router className='text-deep-sea h-32 w-32' />
                    <div className='text-deep-sea absolute top-3 left-3 p-6 text-sm'>
                      Seazr Hub
                    </div>
                  </div>
                </Card>
              </div>

              <div className='space-y-6 md:col-span-3'>
                {[
                  {
                    step: 1,
                    title: 'Connect the Seazr Hub',
                    description:
                      'Install our compact hub device on your boat to connect with existing sensors.',
                  },
                  {
                    step: 2,
                    title: 'Pair Your Sensors',
                    description:
                      'Our hub automatically detects and pairs with your existing sensors.',
                  },
                  {
                    step: 3,
                    title: 'Access Your Dashboard',
                    description:
                      "View all your boat's data in our intuitive mobile app or web dashboard.",
                  },
                ].map((item, index) => (
                  <div key={index} className='relative'>
                    {index > 0 && (
                      <div className='bg-primary/30 absolute -top-3 left-5 h-3 w-0.5'></div>
                    )}
                    <Card className='border-border hover:border-primary/20 bg-white shadow-sm transition-all duration-300 hover:translate-x-1'>
                      <CardContent className='flex gap-4 p-6'>
                        <div className='bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm'>
                          {item.step}
                        </div>
                        <div>
                          <h3 className='text-xl font-bold'>{item.title}</h3>
                          <p className='text-muted-foreground mt-2'>
                            {item.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id='contact'
          className='relative w-full overflow-hidden bg-white py-20 md:py-28 lg:py-32'
        >
          <div className='bg-primary/5 pattern-waves absolute inset-0 opacity-40'></div>

          <div className='relative z-10 container mx-auto max-w-6xl px-4 md:px-6'>
            <div className='mx-auto flex max-w-2xl flex-col items-center justify-center space-y-8 text-center'>
              <Badge
                variant='outline'
                className='bg-primary/10 border-primary/20 text-primary'
              >
                <Waves className='mr-1.5 h-3.5 w-3.5' />
                <span>Connect Your Boat</span>
              </Badge>
              <h2 className='text-foreground text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl'>
                Ready to Make Your Boat Smart?
              </h2>
              <p className='text-muted-foreground max-w-lg text-lg md:text-xl'>
                Get Seazr today and never worry about your boat when you are not
                aboard.
              </p>
              <div className='border-primary/20 mt-6 w-full max-w-md rounded-lg border bg-white p-1 shadow-lg'>
                <Button
                  asChild
                  className='bg-primary hover:bg-primary/90 m-8 h-12 shadow-lg'
                >
                  <Link href='/signup'>Create Account</Link>
                </Button>
                <p className='text-muted-foreground mt-2 px-3 pb-3 text-center text-xs'>
                  By signing up, you agree to our Terms of Service and Privacy
                  Policy.
                </p>
              </div>
            </div>
          </div>

          {/* Decorative wave pattern at bottom */}
          <div className='absolute bottom-0 left-0 w-full'>
            <svg
              viewBox='0 0 1200 120'
              preserveAspectRatio='none'
              className='text-sand h-6 w-full fill-current md:h-10'
            >
              <path d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C136.33,2,203.63,36.92,267.93,52.74,285.92,56.95,304.23,60.15,321.39,56.44Z'></path>
            </svg>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='bg-sand w-full py-12 md:py-16'>
        <div className='container mx-auto max-w-6xl px-4 md:px-6'>
          <div className='grid gap-8 sm:grid-cols-2 md:grid-cols-4'>
            <div className='space-y-4'>
              <Link
                href='/'
                className='flex items-center gap-2'
                aria-label='Seazr home'
              ></Link>
              <p className='text-muted-foreground text-sm'>
                seazr - technology for every boat
              </p>
            </div>

            {[
              {
                title: 'Product',
                links: [
                  { label: 'Features', href: '#features' },
                  { label: 'How It Works', href: '#how-it-works' },
                  { label: 'Pricing', href: '#pricing' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About Us', href: '#' },
                  { label: 'Blog', href: '#' },
                  { label: 'Careers', href: '#' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Terms of Service', href: '#' },
                  { label: 'Cookie Policy', href: '#' },
                ],
              },
            ].map((section) => (
              <div key={section.title} className='space-y-4'>
                <h4 className='text-sm font-bold'>{section.title}</h4>
                <ul className='space-y-2 text-sm'>
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className='text-muted-foreground hover:text-primary transition-colors'
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className='mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row'>
            <p className='text-muted-foreground text-xs'>
              © {new Date().getFullYear()} Seazr. All rights reserved.
            </p>
            <div className='flex gap-4'>
              <Link
                href='#'
                className='text-muted-foreground hover:text-primary transition-colors'
                aria-label='Facebook'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='h-5 w-5'
                >
                  <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'></path>
                </svg>
              </Link>
              <Link
                href='#'
                className='text-muted-foreground hover:text-primary transition-colors'
                aria-label='Instagram'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='h-5 w-5'
                >
                  <rect x='2' y='2' width='20' height='20' rx='5' ry='5'></rect>
                  <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'></path>
                  <line x1='17.5' y1='6.5' x2='17.51' y2='6.5'></line>
                </svg>
              </Link>
              <Link
                href='#'
                className='text-muted-foreground hover:text-primary transition-colors'
                aria-label='Twitter'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='h-5 w-5'
                >
                  <path d='M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z'></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
