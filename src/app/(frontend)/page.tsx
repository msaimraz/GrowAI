import { redirect } from 'next/navigation';

/**
 * Landing Page Bypass:
 * Temporarily disables the landing page and routes incoming traffic directly to the GrowAI app.
 * To restore the original public landing page in the future, import and render `LandingPageContent`
 * from `@/components/landing/LandingPageContent`.
 */
export default function HomePage() {
  redirect('/app');
}
