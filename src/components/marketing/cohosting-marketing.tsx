"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  DollarSign,
  Star,
  Users,
} from "lucide-react";

export default function CohostingMarketing() {
  return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="flex items-center gap-3">
                <img
                  src="https://revolvecohosts.com/wp-content/uploads/2026/03/rch_2-removebg-preview.png"
                  alt="Revolve Co-Hosts"
                  className="h-10 w-auto"
                />
              </Link>
              <button
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2 rounded-lg transition-colors font-semibold"
              >
                Apply Now
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          {/* Hero Section */}
          <div className="text-center mb-16 sm:mb-24">
            <div className="inline-flex items-center gap-2 bg-[#10B981]/10 text-[#10B981] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Star className="w-4 h-4 fill-current" />
              Premium Co-Hosting Service
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Let Us Manage Your Airbnb<br />While You Earn More
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Professional co-hosting that handles everything from guest communication to pricing optimization.
              Starting from just <span className="text-[#10B981] font-bold">$99/month per property</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                className="bg-[#10B981] hover:bg-[#059669] text-white px-10 py-5 rounded-xl font-bold text-xl transition-all shadow-lg hover:scale-105 transform w-full sm:w-auto"
              >
                Apply for Co-Hosting
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-6 h-6 fill-[#10B981] text-[#10B981]" />
              ))}
            </div>
            <p className="text-muted-foreground">
              <span className="font-bold text-foreground">4.9/5</span> from 347 property owners
            </p>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: DollarSign,
                title: 'Increase Your Revenue',
                description: 'Our hosts earn 35% more on average with dynamic pricing and optimization'
              },
              {
                icon: Clock,
                title: 'Save Your Time',
                description: 'We handle guest communication, bookings, and day-to-day management 24/7'
              },
              {
                icon: Users,
                title: 'Expert Support',
                description: 'Dedicated co-host team with years of Airbnb experience managing 500+ properties'
              }
            ].map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="bg-card border border-border rounded-2xl p-8 text-center hover:border-[#10B981] transition-colors">
                  <div className="w-16 h-16 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-[#10B981]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          {/* What's Included */}
          <div className="bg-gradient-to-br from-[#10B981]/5 to-[#059669]/5 rounded-3xl p-8 sm:p-12 mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">What's Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                'Complete listing optimization & management',
                '24/7 guest communication & support',
                'Dynamic pricing & revenue management',
                'Professional photo editing & listing copy',
                'Guest screening & booking management',
                'Review management & response',
                'Calendar synchronization across platforms',
                'Monthly performance reports & insights',
                'Cleaning & maintenance coordination',
                'Smart pricing adjustments for events & seasons'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">What Property Owners Say</h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">Join hundreds of successful hosts</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Sarah Mitchell',
                  property: '3-bed beach house, Miami',
                  rating: 5,
                  text: "Revenue increased by 42% in the first 3 months. The team handles everything professionally and I finally have my weekends back. Best decision I've made for my rental business.",
                  result: '+$2,840/mo'
                },
                {
                  name: 'David Chen',
                  property: 'Downtown condo, Austin',
                  rating: 5,
                  text: "I was skeptical about the pricing but the ROI is incredible. They optimized my listing, improved my photos, and now I'm consistently booked at higher rates. Worth every penny.",
                  result: '+$1,650/mo'
                },
                {
                  name: 'Jennifer Torres',
                  property: 'Mountain cabin, Denver',
                  rating: 5,
                  text: "The 24/7 guest support alone is worth it. They handle all the questions, bookings, and issues. I just collect the payments. My occupancy rate went from 65% to 91%.",
                  result: '+$3,200/mo'
                },
                {
                  name: 'Michael Roberts',
                  property: '2 properties, Phoenix',
                  rating: 5,
                  text: "Managing two properties was overwhelming. Now both are running smoothly with better reviews and higher income. The monthly reports show exactly where the improvements come from.",
                  result: '+$4,100/mo combined'
                },
                {
                  name: 'Lisa Anderson',
                  property: 'Lake house, Seattle',
                  rating: 5,
                  text: "They turned my underperforming listing into a top earner in my area. The dynamic pricing strategy alone added $800/month. Professional, responsive, and results-driven.",
                  result: '+$2,100/mo'
                },
                {
                  name: 'James Wilson',
                  property: 'Historic home, Charleston',
                  rating: 5,
                  text: "After 2 years of managing myself, I wish I'd found them sooner. Guest communication is handled perfectly, pricing is optimized daily, and my stress level is zero. Highly recommend.",
                  result: '+$1,890/mo'
                }
              ].map((review, idx) => (
                <div key={idx} className="bg-card border border-border rounded-2xl p-6 hover:border-[#10B981] transition-colors">
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-[#10B981] text-[#10B981]" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{review.text}"</p>
                  <div className="pt-4 border-t border-border">
                    <div className="font-bold">{review.name}</div>
                    <div className="text-sm text-muted-foreground mb-2">{review.property}</div>
                    <div className="inline-block bg-[#10B981]/10 text-[#10B981] px-3 py-1 rounded-full text-sm font-semibold">
                      {review.result}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-3xl p-8 sm:p-12 text-white mb-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl mb-8 opacity-90">No hidden fees. No long-term contracts.</p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto mb-8">
              <div className="text-6xl font-bold mb-2">$99</div>
              <div className="text-2xl mb-6">per property, per month</div>

              <div className="text-left space-y-3 mb-6">
                {[
                  'Full co-hosting service included',
                  'No commission on bookings',
                  'Cancel anytime',
                  'First month satisfaction guarantee'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white/10 rounded-xl p-4 text-sm">
                <span className="opacity-75">Average host ROI: </span>
                <span className="font-bold text-xl">+$1,847/month</span>
              </div>
            </div>

            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="bg-white text-[#10B981] px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-50 transition-all shadow-lg hover:scale-105 transform"
            >
              Apply Now
              <ArrowRight className="w-5 h-5 inline ml-2" />
            </button>

            <p className="mt-6 text-sm opacity-75">Limited spots available • Response within 24 hours</p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 text-center">
            {[
              { number: '500+', label: 'Properties Managed' },
              { number: '347', label: 'Happy Owners' },
              { number: '4.9/5', label: 'Average Rating' },
              { number: '$8.2M+', label: 'Revenue Generated' }
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-3xl sm:text-4xl font-bold text-[#10B981] mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="bg-card border-2 border-[#10B981] rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Maximize Your Airbnb Income?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join successful property owners who are earning more while doing less. Apply today and get a free consultation.
            </p>

            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-12 py-6 rounded-xl font-bold text-2xl transition-all shadow-lg hover:scale-105 transform mb-6"
            >
              Apply for Co-Hosting Service
              <ArrowRight className="w-6 h-6 inline ml-2" />
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#10B981]" />
                No upfront costs
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#10B981]" />
                Cancel anytime
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#10B981]" />
                30-day guarantee
              </div>
            </div>
          </div>
        </div>
      </div>

  );
}
