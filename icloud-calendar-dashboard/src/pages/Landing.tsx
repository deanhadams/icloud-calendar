import { FeatureCards } from '../components/landing/FeatureCards'
import { Hero } from '../components/landing/Hero'
import { LandingFooter } from '../components/landing/LandingFooter'
import { LandingHeader } from '../components/landing/LandingHeader'
import { StatsStrip } from '../components/landing/StatsStrip'
import { Testimonials } from '../components/landing/Testimonials'

export function Landing() {
  return (
    <div>
      <LandingHeader />
      <Hero />
      <FeatureCards />
      <StatsStrip />
      <Testimonials />
      <LandingFooter />
    </div>
  )
}
