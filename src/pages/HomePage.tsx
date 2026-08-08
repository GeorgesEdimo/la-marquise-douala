import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Menu from '@/components/Menu'
import CocktailsBanner from '@/components/CocktailsBanner'
import Gallery from '@/components/Gallery'
import HoursLocation from '@/components/HoursLocation'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import MobileReserveBar from '@/components/MobileReserveBar'
import AssistantWidget from '@/components/AssistantWidget'
import CookieBanner from '@/components/CookieBanner'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <About />
        <Menu />
        <CocktailsBanner />
        <Gallery />
        <HoursLocation />
        <Contact />
      </main>
      <Footer />
      <MobileReserveBar />
      <AssistantWidget />
      <CookieBanner />
    </>
  )
}
