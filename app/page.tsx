import Link from "next/link";
import Image from "next/image";
import { BarChart3, Compass, Gauge, Globe, Waves } from "lucide-react";

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="Seazr home"
          >
            <div className="relative w-32 h-32">
              <Image
                src="/logo.svg"
                alt="Seazr Logo"
                width={64}
                height={64}
                className="w-full h-full"
                priority
                unoptimized
              />
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium hover:text-primary relative group transition-colors"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:text-primary relative group transition-colors"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          </nav>

          <Button asChild className="shadow-subtle">
            <Link href="#contact">Login</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 hero-gradient wave-bottom relative overflow-hidden">
          <div className="absolute top-1/2 right-0 w-2/3 h-2/3 bg-sea-foam opacity-10 rounded-full blur-3xl transform -translate-y-1/2"></div>

          <div className="container px-4 md:px-6 max-w-6xl mx-auto relative z-10">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="p-6 md:p-0 flex flex-col justify-center space-y-8">
                <div className="text-center lg:text-left space-y-6">
                  <div className="hidden md:block">
                    <Badge
                      variant="secondary"
                      className="inline-flex items-center gap-1.5 py-1 px-3 shadow-sm"
                    >
                      <Waves className="h-4 w-4" />
                      Smart Marine Technology
                    </Badge>
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                    Make Your Boat <span className="logo-gradient">Smart</span>{" "}
                    with Existing Sensors
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
                    Seazr transforms your existing boat sensors into smart IoT
                    devices, giving you real-time monitoring and peace of mind
                    from anywhere in the world.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                  <Button size="lg" asChild className="shadow-subtle">
                    <Link href="#contact">Get Started</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="shadow-sm"
                  >
                    <Link href="#how-it-works">How It Works</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-end">
                <div className="relative">
                  <div
                    className="absolute inset-0 bg-primary rounded-lg opacity-10 blur-xl animate-float"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <Card className="relative bg-white p-1 rounded-lg shadow-xl animate-float border-primary/10">
                    <CardContent className="p-0">
                      <div className="bg-sand rounded-md p-6 flex flex-col space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="ml-auto text-xs text-muted-foreground font-mono">
                            Seazr Dashboard
                          </div>
                        </div>
                        <div className="bg-white outline-2 outline-blue-100 bd-gray rounded-md shadow-sm p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-bold">
                              Vessel Status
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 border-green-300"
                            >
                              Normal
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-wave-crest p-3 rounded-md shadow-sm">
                              <div className="text-xs text-muted-foreground">
                                Battery
                              </div>
                              <div className="text-xl font-bold text-deep-sea">
                                95%
                              </div>
                            </div>
                            <div className="bg-wave-crest p-3 rounded-md shadow-sm">
                              <div className="text-xs text-muted-foreground">
                                Bilge
                              </div>
                              <div className="text-xl font-bold text-deep-sea">
                                Normal
                              </div>
                            </div>
                            <div className="bg-wave-crest p-3 rounded-md shadow-sm">
                              <div className="text-xs text-muted-foreground">
                                Temperature
                              </div>
                              <div className="text-xl font-bold text-deep-sea">
                                72°F
                              </div>
                            </div>
                            <div className="bg-wave-crest p-3 rounded-md shadow-sm">
                              <div className="text-xs text-muted-foreground">
                                Humidity
                              </div>
                              <div className="text-xl font-bold text-deep-sea">
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
          id="features"
          className="w-full py-20 md:py-28 lg:py-32 bg-white"
        >
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <Badge
                variant="outline"
                className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm"
              >
                <Compass className="mr-1 h-4 w-4 text-primary" />
                <span>Smart Marine Technology</span>
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Key Features
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Seazr transforms your existing boat sensors into a connected
                smart system
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {[
                {
                  icon: Globe,
                  title: "Remote Monitoring",
                  description:
                    "Monitor your boat's vital systems from anywhere in the world using our mobile app or web dashboard.",
                },
                {
                  icon: Gauge,
                  title: "Legacy Sensor Integration",
                  description:
                    "Works with your existing sensors - no need to replace your current equipment.",
                },
                {
                  icon: BarChart3,
                  title: "Real-time Alerts",
                  description:
                    "Receive instant notifications about critical issues like battery levels, bilge pump activity, or security breaches.",
                },
              ].map((feature, index) => (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Card className="relative h-full bg-white hover:border-primary/20 transition-all hover-lift">
                    <CardContent className="p-8">
                      <div className="mb-4">
                        <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center shadow-sm">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground flex-grow">
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
          id="how-it-works"
          className="w-full py-12 md:py-20 lg:py-28 bg-secondary relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-1/2 h-full bg-wave-crest opacity-10 rounded-l-full"></div>

          <div className="container px-4 md:px-6 max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col items-center justify-center space-y-3 text-center max-w-3xl mx-auto">
              <Badge
                variant="outline"
                className="inline-flex items-center rounded-lg bg-background/80 px-3 py-1 text-sm"
              >
                <Compass className="mr-1 h-4 w-4 text-primary" />
                <span>Simple 3-Step Process</span>
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight lg:text-4xl">
                How Seazr Works
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Simple installation, powerful results in minutes
              </p>
            </div>

            {/* Mobile View - Vertical Stack */}
            <div className="md:hidden mt-8 space-y-6">
              <div className="bg-white p-3 rounded-xl shadow-lg hover-lift">
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 flex items-center justify-center bg-wave-crest/50">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-1/3 h-1/3 text-deep-sea"
                    >
                      <path
                        d="M30,20 L70,20 C75,20 80,25 80,30 L80,70 C80,75 75,80 70,80 L30,80 C25,80 20,75 20,70 L20,30 C20,25 25,20 30,20 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M35,30 L65,30 C67,30 70,32 70,35 L70,65 C70,68 67,70 65,70 L35,70 C32,70 30,68 30,65 L30,35 C30,32 32,30 35,30 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <line
                        x1="30"
                        y1="40"
                        x2="70"
                        y2="40"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <line
                        x1="30"
                        y1="50"
                        x2="70"
                        y2="50"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <line
                        x1="30"
                        y1="60"
                        x2="70"
                        y2="60"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle cx="50" cy="75" r="2" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded text-xs font-medium text-deep-sea">
                    Seazr Hub
                  </div>
                </div>
              </div>

              {[
                {
                  step: 1,
                  title: "Connect the Seazr Hub",
                  description:
                    "Install our compact hub on your boat. Quick and simple setup.",
                },
                {
                  step: 2,
                  title: "Pair Your Sensors",
                  description:
                    "Hub automatically detects your existing sensors.",
                },
                {
                  step: 3,
                  title: "Access Your Dashboard",
                  description:
                    "View boat data in our mobile app or web dashboard.",
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  {index > 0 && (
                    <div className="absolute -top-3 left-5 h-3 w-0.5 bg-primary/30"></div>
                  )}
                  <Card className="bg-white shadow-sm border hover-lift">
                    <CardContent className="p-4 flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-base font-bold">{item.title}</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Desktop View - Grid Layout */}
            <div className="hidden md:grid md:grid-cols-5 gap-8 mt-12 items-center">
              <div className="md:col-span-2 relative">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-3xl"></div>
                <Card className="bg-white p-4 rounded-xl shadow-lg relative z-10 hover-lift">
                  <CardContent className="p-0">
                    <div className="aspect-square relative overflow-hidden rounded-lg">
                      <div className="absolute inset-0 flex items-center justify-center bg-wave-crest">
                        <svg
                          viewBox="0 0 100 100"
                          className="w-1/2 h-1/2 text-deep-sea"
                        >
                          <path
                            d="M30,20 L70,20 C75,20 80,25 80,30 L80,70 C80,75 75,80 70,80 L30,80 C25,80 20,75 20,70 L20,30 C20,25 25,20 30,20 Z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="M35,30 L65,30 C67,30 70,32 70,35 L70,65 C70,68 67,70 65,70 L35,70 C32,70 30,68 30,65 L30,35 C30,32 32,30 35,30 Z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <line
                            x1="30"
                            y1="40"
                            x2="70"
                            y2="40"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <line
                            x1="30"
                            y1="50"
                            x2="70"
                            y2="50"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <line
                            x1="30"
                            y1="60"
                            x2="70"
                            y2="60"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <circle cx="50" cy="75" r="2" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="absolute top-0 left-0 w-full p-2 flex items-center space-x-1">
                        <div className="w-2 h-2 bg-deep-sea rounded-full"></div>
                        <div className="text-xs text-deep-sea font-medium">
                          Seazr Hub
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-3 space-y-6">
                {[
                  {
                    step: 1,
                    title: "Connect the Seazr Hub",
                    description:
                      "Install our compact hub device on your boat to connect with existing sensors.",
                  },
                  {
                    step: 2,
                    title: "Pair Your Sensors",
                    description:
                      "Our hub automatically detects and pairs with your existing sensors.",
                  },
                  {
                    step: 3,
                    title: "Access Your Dashboard",
                    description:
                      "View all your boat's data in our intuitive mobile app or web dashboard.",
                  },
                ].map((item, index) => (
                  <div key={index} className="relative">
                    {index > 0 && (
                      <div className="absolute -top-3 left-5 h-3 w-0.5 bg-primary/30"></div>
                    )}
                    <Card className="bg-white shadow-sm border-border hover:border-primary/20 hover:translate-x-1 transition-all duration-300">
                      <CardContent className="p-6 flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                          {item.step}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{item.title}</h3>
                          <p className="text-muted-foreground mt-2">
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
          id="contact"
          className="w-full py-20 md:py-28 lg:py-32 cta-gradient text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute top-0 left-0 w-full h-32 bg-white opacity-10"
              style={{ transform: "skewY(-5deg)" }}
            ></div>
            <div
              className="absolute bottom-0 right-0 w-full h-32 bg-white opacity-10"
              style={{ transform: "skewY(5deg)" }}
            ></div>
          </div>

          <div className="container px-4 md:px-6 max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-2xl mx-auto">
              <Badge
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-transparent"
              >
                <Waves className="mr-1.5 h-3.5 w-3.5" />
                <span>Connect Your Boat</span>
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Ready to Make Your Boat Smart?
              </h2>
              <p className="text-white/90 text-lg md:text-xl max-w-lg">
                Get Seazr today and never worry about your boat
                when you are not aboard.
              </p>
              <div className="w-full max-w-md mt-6 border border-white/20 rounded-lg p-1 backdrop-blur-sm bg-white/5">
                <Button
                  type="submit"
                  className="m-8 h-12 bg-primary !text-white hover:bg-primary/90 shadow-lg"
                >
                  Create Account
                </Button>
                <p className="text-xs text-white/70 mt-2 text-center px-3 pb-3">
                  By signing up, you agree to our Terms of Service and Privacy
                  Policy.
                </p>
              </div>
            </div>
          </div>

          {/* Decorative wave pattern at bottom */}
          <div className="absolute bottom-0 left-0 w-full">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="w-full h-6 md:h-10 text-background fill-current"
            >
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C136.33,2,203.63,36.92,267.93,52.74,285.92,56.95,304.23,60.15,321.39,56.44Z"></path>
            </svg>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-background py-12 md:py-16">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-4">
              <Link
                href="/"
                className="flex items-center gap-2"
                aria-label="Seazr home"
              >
                <div className="relative w-24 h-24">
                  <Image
                    src="/logo.svg"
                    alt="Seazr Logo"
                    width={24}
                    height={24}
                    className="w-full h-full"
                  />
                </div>
              </Link>
              <p className="text-sm text-muted-foreground">
                Smart Technology for Every Boat
              </p>
            </div>

            {[
              {
                title: "Product",
                links: [
                  { label: "Features", href: "#features" },
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Pricing", href: "#pricing" },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "About Us", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Careers", href: "#" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                  { label: "Cookie Policy", href: "#" },
                ],
              },
            ].map((section) => (
              <div key={section.title} className="space-y-4">
                <h4 className="text-sm font-bold">{section.title}</h4>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Seazr. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
