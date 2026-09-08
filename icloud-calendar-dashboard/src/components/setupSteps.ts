// Single source of truth for the Apple app-specific-password setup copy —
// both SetupSlideshow's captions and the condensed reference list on the
// Apple app-password page read from this.
export const SETUP_STEPS = [
  {
    title: 'Go to appleid.apple.com and sign in',
    description:
      'Sign in with your Apple ID and password. Use Chrome, Firefox, or Edge rather than Safari, which some users report issues with during this flow.',
  },
  {
    title: 'Open Sign-In and Security',
    description: 'In the left sidebar (or main menu on mobile), select "Sign-In and Security."',
  },
  {
    title: 'Select App-Specific Passwords',
    description: 'Click "App-Specific Passwords" in that section.',
  },
  {
    title: 'Generate a new password',
    description: 'Click "Generate an app-specific password" or the "+" button.',
  },
  {
    title: 'Label it',
    description:
      'Give it a name you\'ll recognize later, e.g. "Syncal" — this makes it easy to identify and revoke later if needed.',
  },
  {
    title: 'Copy the generated password',
    description: "Apple shows it once. Copy it immediately; you won't be able to view it again after leaving the page.",
  },
  {
    title: 'Paste it into Syncal',
    description: 'Use this password (not your regular Apple ID password) when adding a calendar in the Syncal dashboard.',
  },
]
