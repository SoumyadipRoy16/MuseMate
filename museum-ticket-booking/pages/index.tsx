import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import '../app/globals.css'

const changingWords = ["Time", "Culture", "History", "Creativity"]

export default function EnhancedLandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoginView, setIsLoginView] = useState(true)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [formError, setFormError] = useState('')

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const { name, email, password } = formData
    const type = isLoginView ? 'login' : 'signup'

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, type })
      })
      const data = await response.json()

      if (response.ok) {
        if (isLoginView) {
          // Handle successful login, e.g., redirect
          window.location.href = data.redirectUrl
        } else {
          // Handle successful signup
          alert(data.message)
          setIsLoginView(true)
        }
      } else {
        // Handle errors
        setFormError(data.message)
      }
    } catch (error) {
      setFormError('An error occurred. Please try again.')
    }
  }

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % changingWords.length)
    }, 3000)

    return () => clearInterval(wordInterval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stripeWidth = 30
    const stripeSpacing = 60
    let currentStripe = 0
    let beamProgress = 0

    const drawStripes = () => {
      ctx.save()
      ctx.rotate(-Math.PI / 4)
      const diagonal = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height)
      for (let x = -diagonal; x < diagonal; x += stripeSpacing) {
        ctx.fillStyle = x % (stripeSpacing * 2) === 0 ? 'rgba(205, 133, 63, 0.1)' : 'rgba(205, 133, 63, 0.05)'
        ctx.fillRect(x, -diagonal, stripeWidth, diagonal * 2)
      }
      ctx.restore()
    }

    const drawBeam = (stripeIndex: number, progress: number) => {
      ctx.save()
      ctx.rotate(-Math.PI / 4)
      const diagonal = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height)
      const x = -diagonal + stripeIndex * stripeSpacing + stripeWidth / 2
      const y = -diagonal + progress * diagonal * 2

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50)
      gradient.addColorStop(0, 'rgba(205, 133, 63, 0.8)')
      gradient.addColorStop(1, 'rgba(205, 133, 63, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, 50, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawStripes()
      drawBeam(currentStripe, beamProgress)

      beamProgress += 0.005
      if (beamProgress > 1) {
        beamProgress = 0
        currentStripe = (currentStripe + 1) % (Math.ceil(canvas.width / stripeSpacing) + 1)
      }

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    // Google Tag Manager Scripts
    // Create script element for Google Tag Manager
    const script = document.createElement('script')
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-Z228CZ7BH0'
    script.async = true
    document.head.appendChild(script)

    // Inline script to initialize Google Tag Manager
    const inlineScript = document.createElement('script')
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-Z228CZ7BH0');
    `
    document.head.appendChild(inlineScript)

    // Cleanup function to remove the scripts if component is unmounted
    return () => {
      document.head.removeChild(script)
      document.head.removeChild(inlineScript)
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-amber-100 to-amber-300 text-amber-900 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute inset-0 bg-white opacity-10" />
      <div className="relative z-10">
        <header className="p-6 flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">MuseMate</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="#quiz" className="text-lg font-semibold relative group">
                  Quiz
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-lg font-semibold relative group">
                  Gallery
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
                </a>
              </li>
            </ul>
          </nav>
        </header>
        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-8 leading-tight"
          >
            Journey Through{' '}
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWordIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="inline-block text-amber-600 animate-pulse"
              >
                {changingWords[currentWordIndex]}
              </motion.span>
            </AnimatePresence>
            {' '}and Art
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl sm:text-2xl mb-12 max-w-2xl"
          >
            Discover masterpieces, unravel history, and immerse yourself in culture. Your adventure begins with a click.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="relative text-lg px-12 py-6 bg-amber-500 text-amber-100 hover:bg-amber-900 transition-colors duration-300 transform rotate-1 hover:rotate-0 shadow-lg hover:shadow-xl border-4 border-amber-600 overflow-hidden group"
                >
                  <span className="relative z-10">Book A Ticket</span>
                  <span className="absolute inset-0 bg-amber-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Styling stripes */}
                  <span className="absolute top-0 left-0 w-full h-2 bg-amber-600" />
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-amber-600" />
                  <span className="absolute top-0 left-0 w-2 h-full bg-amber-600" />
                  <span className="absolute top-0 right-0 w-2 h-full bg-amber-600" />
                  {/* Inner crosshair style */}
                  <span className="absolute top-1/2 left-0 w-full h-[1px] bg-amber-400 opacity-50" />
                  <span className="absolute top-0 left-1/2 w-[1px] h-full bg-amber-400 opacity-50" />
                  {/* Rounded corners */}
                  <span className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-amber-600 rounded-tl-full" />
                  <span className="absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-amber-600 rounded-tr-full" />
                  <span className="absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-amber-600 rounded-bl-full" />
                  <span className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-amber-600 rounded-br-full" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white p-6 shadow-lg rounded-md">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{isLoginView ? 'Login' : 'Sign Up'}</h3>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="auth-toggle">
                        {isLoginView ? 'Need an account?' : 'Already have an account?'}
                      </Label>
                      <Switch
                        id="auth-toggle"
                        checked={!isLoginView}
                        onCheckedChange={() => setIsLoginView(!isLoginView)}
                        className="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-200"
                      >
                        <span
                          className={`${
                            !isLoginView ? 'translate-x-6' : 'translate-x-1'
                          } inline-block w-4 h-4 transform bg-black rounded-full transition-transform`}
                        />
                      </Switch>
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    {isLoginView ? (
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Enter your password" required />
                          </div>
                          {formError && <p className="text-red-500">{formError}</p>}
                          <Button type="submit" className="w-full bg-black text-white">Login</Button>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="signup"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="Enter your name" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Create a password" required />
                          </div>
                          {formError && <p className="text-red-500">{formError}</p>}
                          <Button type="submit" className="w-full bg-black text-white">Sign Up</Button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </main>
        <footer className="p-6 bg-amber-800 text-amber-100 text-center">
          <p>&copy; {new Date().getFullYear()} MuseMate. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
