import { FeatureCards } from '../components/landing/FeatureCards'
import { Hero } from '../components/landing/Hero'
import { LandingFooter } from '../components/landing/LandingFooter'
import { LandingHeader } from '../components/landing/LandingHeader'
import { StatsStrip } from '../components/landing/StatsStrip'
import { Testimonials } from '../components/landing/Testimonials'
import { JsonLd } from '../components/JsonLd'
import { PageMeta } from '../components/PageMeta'

const DESCRIPTION =
  'A simple REST API for reading and writing iCloud Calendar events. No CalDAV protocol knowledge required.'

const SOFTWARE_APPLICATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Syncal',
  description: DESCRIPTION,
  applicationCategory: 'DeveloperApplication',
}

export function Landing() {
  return (
    <div>
      <PageMeta title="Syncal — iCloud Calendar API for developers" description={DESCRIPTION} path="/" />
      <JsonLd data={SOFTWARE_APPLICATION_JSON_LD} />
      <LandingHeader />
      <Hero />
      <FeatureCards />
      <StatsStrip />
      <Testimonials />
      <LandingFooter />
    </div>
  )
}
