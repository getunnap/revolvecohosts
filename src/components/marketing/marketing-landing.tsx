"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { PENDING_AUDIT_KEY } from "@/lib/client-storage";
import MarketingSiteHeader from "@/components/marketing/marketing-site-header";

export default function MarketingLanding() {
  const router = useRouter();
  const [listingUrl, setListingUrl] = useState("");

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    const u = listingUrl.trim();
    if (!u) return;
    try {
      sessionStorage.setItem(
        PENDING_AUDIT_KEY,
        JSON.stringify({
          listingUrl: u,
          targetGuest: "Leisure and business travelers",
        }),
      );
    } catch {
      /* ignore */
    }
    router.push("/capture-email");
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketingSiteHeader cta={{ href: "#hero-form", label: "Analyze free" }} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 via-transparent to-[#059669]/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-8">
              <Star className="w-4 h-4 text-[#10B981] fill-[#10B981]" />
              <span className="text-sm text-muted-foreground">Trusted by 10,000+ hosts</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Unlock 30% More Revenue from Your Airbnb in 30 Days
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Get a free instant analysis showing exactly what is costing you money.
            </p>

            {/* Main CTA Form */}
            <form id="hero-form" onSubmit={handleContinue} className="max-w-2xl mx-auto mb-8 scroll-mt-28">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-card border border-border rounded-xl shadow-lg">
                <input
                  type="url"
                  value={listingUrl}
                  onChange={(e) => setListingUrl(e.target.value)}
                  placeholder="Paste your Airbnb listing URL here..."
                  required
                  className="flex-1 px-4 py-4 bg-transparent border-0 outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="bg-[#10B981] text-white px-8 py-4 rounded-lg hover:bg-[#059669] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Get Free Analysis
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-600" />
                  Instant analysis
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-600" />
                  See your revenue potential
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-600" />
                  Get actionable insights
                </span>
              </p>
            </form>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto pt-8 border-t border-border">
              <div>
                <div className="text-2xl sm:text-3xl mb-1">$2.4M+</div>
                <div className="text-sm text-muted-foreground">Extra Revenue Generated</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl mb-1">10K+</div>
                <div className="text-sm text-muted-foreground">Active Hosts</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl mb-1">4.9/5</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Our AI Works */}
      <section id="features" className="py-20 bg-muted/30 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(16, 185, 129) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4">Powered by Industry-Leading Data Sources</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI analyzes your listing using data from the most trusted platforms and expert insights
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Main Diagram Container with unified background */}
            <div className="relative bg-gradient-to-br from-[#10B981]/5 via-card/80 to-[#059669]/5 backdrop-blur-sm rounded-3xl border-2 border-[#10B981]/20 p-8 md:p-12">

              {/* Data Sources and AI Engine Layout */}
              <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-12 mb-12">
                {/* Left Column - Data Sources */}
                <div className="space-y-4 relative">
                  {[
                    {
                      icon: <TrendingUp className="w-5 h-5" />,
                      name: 'Market Data',
                      desc: 'Real comps, pricing, occupancy',
                      sources: 'AirROI, AirDNA, PriceLabs'
                    },
                    {
                      icon: <Sparkles className="w-5 h-5" />,
                      name: 'Listing Data',
                      desc: 'Your Airbnb page details',
                      sources: 'Title, images, reviews, amenities'
                    },
                    {
                      icon: <Star className="w-5 h-5" />,
                      name: 'Optimisation Frameworks',
                      desc: 'What top 1% listings do',
                      sources: 'Benchmarked vs Booking.com, Expedia'
                    }
                  ].map((source, idx) => (
                    <div key={idx} className="relative">
                      <div className="bg-card p-4 rounded-xl border-2 border-[#10B981]/30 shadow-sm relative z-10 hover:border-[#10B981]/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                            {source.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm mb-1">{source.name}</div>
                            <div className="text-xs text-muted-foreground mb-1">{source.desc}</div>
                            <div className="text-xs text-[#10B981] font-medium">→ {source.sources}</div>
                          </div>
                        </div>
                      </div>
                      {/* Connecting line */}
                      <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-12 h-[3px] bg-gradient-to-r from-[#10B981] to-transparent -mr-12 z-0">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Center - AI Engine */}
                <div className="flex items-center justify-center md:mx-8">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-[#10B981] to-[#059669] p-10 rounded-3xl shadow-2xl relative z-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                      <div className="absolute inset-0 rounded-3xl border-4 border-[#10B981]/30"></div>
                      <div className="relative text-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                          <Zap className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-lg font-bold text-white mb-1">AI Analysis</div>
                        <div className="text-sm text-white/90">Engine</div>
                      </div>
                    </div>

                    {/* Pulse rings */}
                    <div className="absolute inset-0 rounded-3xl border-4 border-[#10B981] animate-ping opacity-20"></div>
                    <div className="absolute inset-[-8px] rounded-3xl border-2 border-[#10B981]/30"></div>
                  </div>
                </div>

                {/* Right Column - More Data Sources */}
                <div className="space-y-4 relative">
                  {[
                    {
                      icon: <Zap className="w-5 h-5" />,
                      name: 'AI Analysis',
                      desc: 'Pattern recognition + gap detection',
                      sources: 'Powered by OpenAI'
                    },
                    {
                      icon: <Users className="w-5 h-5" />,
                      name: 'Operator Insights',
                      desc: 'Real host strategies',
                      sources: 'Forums, discussions, expert tactics'
                    },
                    {
                      icon: <Shield className="w-5 h-5" />,
                      name: 'Proprietary Data',
                      desc: 'Internal optimization frameworks',
                      sources: 'Revolve Co-Hosts'
                    }
                  ].map((source, idx) => (
                    <div key={idx} className="relative">
                      <div className="bg-card p-4 rounded-xl border-2 border-[#10B981]/30 shadow-sm relative z-10 hover:border-[#10B981]/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                            {source.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm mb-1">{source.name}</div>
                            <div className="text-xs text-muted-foreground mb-1">{source.desc}</div>
                            <div className="text-xs text-[#10B981] font-medium">→ {source.sources}</div>
                          </div>
                        </div>
                      </div>
                      {/* Connecting line */}
                      <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-12 h-[3px] bg-gradient-to-l from-[#10B981] to-transparent -ml-12 z-0">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Output Flow */}
              <div className="flex flex-col items-center">
                {/* Animated Arrow Down */}
                <div className="relative mb-6">
                  <div className="w-1 h-16 bg-gradient-to-b from-[#10B981] via-[#10B981] to-transparent"></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                    <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[16px] border-l-transparent border-r-transparent border-t-[#10B981]"></div>
                  </div>
                  {/* Animated dots flowing down */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#10B981] rounded-full animate-ping"></div>
                </div>

                <div className="text-xs uppercase tracking-wider text-[#10B981] mb-4 font-semibold">Your Results</div>

                {/* Your Listing Result */}
                <div className="bg-gradient-to-br from-card to-[#10B981]/5 p-8 rounded-2xl border-3 border-[#10B981] shadow-xl w-full max-w-3xl relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent rounded-2xl"></div>
                  <div className="relative text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Your Optimized Listing Strategy</h3>
                    <p className="text-muted-foreground mb-6">
                      Actionable insights on pricing, descriptions, photos, amenities, and more
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {['Dynamic Pricing', 'SEO Optimization', 'Revenue Forecast', 'Competitor Analysis'].map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/30 px-4 py-2 rounded-lg">
                          <Check className="w-4 h-4 text-[#10B981]" />
                          <span className="text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Before & After Results */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4">Real Results from Real Hosts</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how optimization transforms listings and revenue
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Before */}
            <div className="relative">
              <div className="absolute -top-4 left-8 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
                Before
              </div>
              <div className="bg-card border-2 border-red-200 rounded-2xl overflow-hidden">
                {/* Image Placeholder - Replace with your Airbnb screenshot */}
                <div className="aspect-[4/3] bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                    <div className="text-center p-8">
                      <div className="text-sm text-gray-600">Place your BEFORE screenshot here</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Average Monthly Revenue</span>
                      <span className="text-xl sm:text-2xl font-bold">$2,100</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex-1 bg-red-100 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '56%'}}></div>
                      </div>
                      <span>56% occupancy</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="text-red-500 mt-0.5">✗</div>
                      <span className="text-muted-foreground">Generic title and description</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <div className="text-red-500 mt-0.5">✗</div>
                      <span className="text-muted-foreground">Static pricing year-round</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <div className="text-red-500 mt-0.5">✗</div>
                      <span className="text-muted-foreground">Poor quality photos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="relative">
              <div className="absolute -top-4 left-8 bg-[#10B981] text-white px-4 py-2 rounded-full text-sm font-semibold z-10 flex items-center gap-2">
                After
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-card border-2 border-[#10B981] rounded-2xl overflow-hidden shadow-lg">
                {/* Image Placeholder - Replace with your Airbnb screenshot */}
                <div className="aspect-[4/3] bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-300 to-purple-400">
                    <div className="text-center p-8">
                      <div className="text-sm text-white">Place your AFTER screenshot here</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Average Monthly Revenue</span>
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-bold text-[#10B981]">$4,650</div>
                        <div className="text-sm text-[#10B981]">+121% ↑</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex-1 bg-[#10B981]/10 rounded-full h-2">
                        <div className="bg-[#10B981] h-2 rounded-full" style={{width: '89%'}}></div>
                      </div>
                      <span className="font-medium text-[#10B981]">89% occupancy</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="text-[#10B981] mt-0.5">✓</div>
                      <span className="font-medium">SEO-optimized title & description</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <div className="text-[#10B981] mt-0.5">✓</div>
                      <span className="font-medium">Dynamic pricing algorithm</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <div className="text-[#10B981] mt-0.5">✓</div>
                      <span className="font-medium">Professional photography</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-12 max-w-4xl mx-auto bg-gradient-to-br from-[#10B981]/5 to-[#059669]/5 rounded-2xl border-2 border-[#10B981]/20 p-8">
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#10B981] mb-2">+121%</div>
                <div className="text-sm text-muted-foreground">Revenue Increase</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="text-2xl sm:text-3xl font-bold text-[#10B981] mb-2">+59%</div>
                <div className="text-sm text-muted-foreground">Occupancy Boost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#10B981] mb-2">30 Days</div>
                <div className="text-sm text-muted-foreground">Time to Results</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              From analysis to implementation in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Paste Your Listing Link',
                description: 'Get instant free analysis showing what is costing you money, revenue loss scores, and improvement areas'
              },
              {
                step: '2',
                title: 'See Your Revenue Potential',
                description: 'View visual breakdowns of exactly what to improve and how much revenue you are leaving on the table'
              },
              {
                step: '3',
                title: 'Unlock & Implement',
                description: 'Get your full report for $3.49 with copy-paste ready fixes. Implement and start earning more instantly'
              }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center text-white text-xl sm:text-2xl mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#10B981] to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#10B981]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#059669]/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/20 px-4 py-2 rounded-full mb-4">
              <Star className="w-4 h-4 text-[#10B981] fill-[#10B981]" />
              <span className="text-sm font-medium text-[#10B981]">10,000+ Happy Hosts</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4">Loved by Hosts Worldwide</h2>
            <p className="text-lg text-muted-foreground">
              Real stories from hosts who transformed their revenue
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: 'Sarah Johnson',
                location: 'Miami, FL',
                image: '👩',
                rating: 5,
                revenue: '+$1,800/mo',
                text: 'Increased my bookings by 60% in the first month! The pricing suggestions alone were game-changing.'
              },
              {
                name: 'Michael Chen',
                location: 'San Francisco, CA',
                image: '👨',
                rating: 5,
                revenue: '+$2,400/mo',
                text: 'The insights were incredibly detailed. I had no idea my listing description was hurting my search ranking.'
              },
              {
                name: 'Emma Rodriguez',
                location: 'Austin, TX',
                image: '👩‍🦱',
                rating: 5,
                revenue: '+$1,200/mo',
                text: 'Simple, fast, and effective. I made the recommended changes and saw results within a week!'
              }
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-card p-6 rounded-2xl border-2 border-border hover:border-[#10B981]/50 hover:shadow-xl transition-all duration-300 group relative"
              >
                {/* Revenue badge */}
                <div className="absolute -top-3 -right-3 bg-gradient-to-br from-[#10B981] to-[#059669] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform">
                  {testimonial.revenue}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 rounded-full flex items-center justify-center text-xl sm:text-2xl border-2 border-[#10B981]/30">
                    {testimonial.image}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#10B981] fill-[#10B981]" />
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {"\u201C"}
                  {testimonial.text}
                  {"\u201D"}
                </p>

                {/* Decorative quote mark */}
                <div className="absolute bottom-4 right-4 text-6xl text-[#10B981]/10 font-serif leading-none">
                  {"\u201D"}
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#10B981]" />
              <span>Free Preview Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#10B981]" />
              <span>$3.49 Per Full Report</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#10B981]" />
              <span>Multi-Listing Discounts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Free analysis preview, then unlock your full optimization report
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Free Preview',
                price: '$0',
                description: 'See what needs fixing',
                features: [
                  'Instant analysis results',
                  'Visual improvement areas',
                  'Revenue loss scores',
                  'Optimization potential',
                  'No credit card required'
                ],
                cta: 'Analyze Now',
                popular: false
              },
              {
                name: 'Single Report',
                price: '$3.49',
                description: 'One listing optimization',
                features: [
                  'Complete analysis breakdown',
                  'Copy-paste ready improvements',
                  'Optimized title & description',
                  'Photo recommendations',
                  'Pricing strategy guide',
                  'Instant delivery'
                ],
                cta: 'Get Full Report',
                popular: true
              },
              {
                name: 'Multi-Listing',
                price: 'From $2.49',
                period: '/report',
                description: 'Volume discounts available',
                features: [
                  'Everything in Single Report',
                  'Up to 30% discount',
                  '3 listings: $2.99 each',
                  '5 listings: $2.69 each',
                  '10+ listings: $2.49 each',
                  'Priority support'
                ],
                cta: 'Get Started',
                popular: false
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`bg-card p-8 rounded-2xl border-2 ${
                  plan.popular ? 'border-[#10B981] shadow-lg scale-105' : 'border-border'
                } relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#10B981] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="mb-2 text-xl font-semibold">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#hero-form"
                  className={`block w-full text-center py-3 rounded-lg transition-colors font-medium ${
                    plan.popular
                      ? 'bg-[#10B981] text-white hover:bg-[#059669]'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/20 px-6 py-3 rounded-full">
              <Shield className="w-5 h-5 text-[#10B981]" />
              <span className="text-sm font-medium">30-Day Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'What do I get for free?',
                a: 'The free analysis shows you visual breakdowns of what needs improving, your revenue loss scores, and optimization potential. You will see exactly what is costing you money before deciding to unlock the full report.'
              },
              {
                q: 'What is included in the $3.49 report?',
                a: 'The full report includes copy-paste ready optimized titles, descriptions, photo recommendations, pricing strategies, and step-by-step implementation guides. Everything you need to maximize your revenue.'
              },
              {
                q: 'How do multi-listing discounts work?',
                a: 'Buy 3 reports at $2.99 each, 5 at $2.69 each, or 10+ at $2.49 each. Perfect for hosts managing multiple properties. The discount applies automatically at checkout.'
              },
              {
                q: 'How long does the analysis take?',
                a: 'The free preview analysis takes just 60 seconds. Once you purchase, your full detailed report is delivered instantly with all copy-paste ready improvements.'
              },
              {
                q: 'Is there a money-back guarantee?',
                a: 'Yes! If you are not satisfied with your report, we offer a 30-day money-back guarantee. No questions asked.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-card p-6 rounded-xl border border-border">
                <h3 className="mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl p-12 text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4">Ready to Unlock Your Hidden Revenue?</h2>
            <p className="text-lg mb-8 opacity-90">
              Get your free analysis now. See exactly how much you are losing. Unlock the full fix for just $3.49.
            </p>
            <form onSubmit={handleContinue} className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-xl">
                <input
                  type="url"
                  value={listingUrl}
                  onChange={(e) => setListingUrl(e.target.value)}
                  placeholder="Paste your Airbnb URL..."
                  required
                  className="flex-1 px-4 py-3 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="bg-foreground text-background px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Get Free Analysis
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                60-second analysis
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                100% secure
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                No credit card
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://revolvecohosts.com/wp-content/uploads/2026/03/rch_2-removebg-preview.png"
                  alt="Revolve Co-Hosts"
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Helping hosts maximize their Airbnb revenue with AI-powered insights.
              </p>
            </div>
            <div>
              <h4 className="mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="mailto:hello@revolvecohosts.com"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="/privacy#security" className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="/privacy#cookies" className="hover:text-foreground transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Revolve Co-Hosts. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
