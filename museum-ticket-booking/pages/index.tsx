'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Facebook, Mail, Sun, Moon } from 'lucide-react'
import { useAuth0 } from '@auth0/auth0-react'
import { ThemeProvider, useTheme } from '../components/ThemeProvider'
import '../app/globals.css'

const changingWords = ["Time", "Culture", "History", "Creativity"]

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full"
    >
      {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
    </Button>
  )
}

function EnhancedLandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoginView, setIsLoginView] = useState(true)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const { loginWithRedirect, isAuthenticated, logout, user } = useAuth0()
  const { theme } = useTheme()

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

  const handleSocialLogin = (provider: string) => {
    loginWithRedirect({
      appState: {
        returnTo: '/chatbot' // The URL to redirect to after login
      }
    });
  };
  
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

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()

    const stripeWidth = 30
    const stripeSpacing = 60
    let currentStripe = 0
    let beamProgress = 0

    const colors = [
      'rgba(139, 69, 19, 0.5)',
      'rgba(205, 133, 63, 0.5)',
      'rgba(210, 180, 140, 0.5)',
      'rgba(255, 228, 181, 0.5)'
    ]

    const drawBackground = (time: number) => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      const colorIndex1 = Math.floor(time / 2000) % colors.length
      const colorIndex2 = (colorIndex1 + 1) % colors.length
      const ratio = (time % 2000) / 2000

      gradient.addColorStop(0, colors[colorIndex1])
      gradient.addColorStop(1, colors[colorIndex2])

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

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

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawBackground(time)
      drawStripes()
      drawBeam(currentStripe, beamProgress)

      beamProgress += 0.005
      if (beamProgress > 1) {
        beamProgress = 0
        currentStripe = (currentStripe + 1) % (Math.ceil(canvas.width / stripeSpacing) + 1)
      }

      requestAnimationFrame(animate)
    }

    animate(0)

    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  useEffect(() => {
    // Google Tag Manager Scripts
    const script = document.createElement('script')
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-Z228CZ7BH0'
    script.async = true
    document.head.appendChild(script)

    const inlineScript = document.createElement('script')
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-Z228CZ7BH0');
    `
    document.head.appendChild(inlineScript)

    return () => {
      document.head.removeChild(script)
      document.head.removeChild(inlineScript)
    }
  }, [])

  return (
    <div className={`relative min-h-screen overflow-hidden ${theme === 'light' ? 'text-amber-900' : 'text-amber-100'}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className={`absolute inset-0 ${theme === 'light' ? 'bg-white opacity-10' : 'bg-black opacity-50'}`} />
      <div className="relative z-10">
        <header className="p-6 flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">MuseMate</h1>
          <nav className="flex items-center space-x-6">
            <ul className="flex space-x-6">
              <li>
                <a href="#quiz" className="text-lg font-semibold relative group">
                  Quiz
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${theme === 'light' ? 'bg-amber-600' : 'bg-amber-400'} transition-all group-hover:w-full`}></span>
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-lg font-semibold relative group">
                  Gallery
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${theme === 'light' ? 'bg-amber-600' : 'bg-amber-400'} transition-all group-hover:w-full`}></span>
                </a>
              </li>
            </ul>
            <ThemeToggle />
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
                  <span className="absolute top-0 left-0 w-full h-2 bg-amber-600" />
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-amber-600" />
                  <span className="absolute top-0 left-0 w-2 h-full bg-amber-600" />
                  <span className="absolute top-0 right-0 w-2 h-full bg-amber-600" />
                  <span className="absolute top-1/2 left-0 w-full h-[1px] bg-amber-400 opacity-50" />
                  <span className="absolute top-0 left-1/2 w-[1px] h-full bg-amber-400 opacity-50" />
                  <span className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-amber-600 rounded-tl-full" />
                  <span className="absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-amber-600 rounded-tr-full" />
                  <span className="absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-amber-600 rounded-bl-full" />
                  <span className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-amber-600 rounded-br-full" />
                </Button>
              </DialogTrigger>
              <DialogContent className={`sm:max-w-[425px] p-6 shadow-lg rounded-md ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{isLoginView ? 'Login' : 'Sign Up'}</h3>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="auth-toggle" className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>
                        {isLoginView ? 'Need an account?' : 'Already have an account?'}
                      </Label>
                      <Switch
                        id="auth-toggle"
                        checked={!isLoginView}
                        onCheckedChange={() => setIsLoginView(!isLoginView)}
                        className="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-200 dark:bg-gray-700"
                      >
                        <span
                          className={`${
                            !isLoginView ? 'translate-x-6' : 'translate-x-1'
                          } inline-block w-4 h-4 transform bg-white dark:bg-gray-200 rounded-full transition-transform`}
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
                            <Label htmlFor="email" className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>Email</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={formData.email} 
                              onChange={handleInputChange} 
                              placeholder="Enter your email" 
                              required 
                              className={theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-100'}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password" className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>Password</Label>
                            <Input 
                              id="password" 
                              type="password" 
                              value={formData.password} 
                              onChange={handleInputChange} 
                              placeholder="Enter your password" 
                              required 
                              className={theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-100'}
                            />
                          </div>
                          {formError && <p className="text-red-500">{formError}</p>}
                          <Button type="submit" className={`w-full ${theme === 'light' ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}>
                            Login
                          </Button>
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
                            <Label htmlFor="name" className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>Name</Label>
                            <Input 
                              id="name" 
                              type="text" 
                              value={formData.name} 
                              onChange={handleInputChange} 
                              placeholder="Enter your name" 
                              required 
                              className={theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-100'}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>Email</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={formData.email} 
                              onChange={handleInputChange} 
                              placeholder="Enter your email" 
                              required 
                              className={theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-100'}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password" className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>Password</Label>
                            <Input 
                              id="password" 
                              type="password" 
                              value={formData.password} 
                              onChange={handleInputChange} 
                              placeholder="Create a password" 
                              required 
                              className={theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-100'}
                            />
                          </div>
                          {formError && <p className="text-red-500">{formError}</p>}
                          <Button type="submit" className={`w-full ${theme === 'light' ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}>
                            Sign Up
                          </Button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleSocialLogin('google-oauth2')}
                      className={`w-full ${
                        theme === 'light'
                          ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          : 'bg-gray-700 text-white border border-gray-600 hover:bg-gray-600'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                    <Button
                      onClick={() => handleSocialLogin('facebook')}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Facebook className="w-5 h-5 mr-2" />
                      Continue with Facebook
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </main>
        <footer className={`p-6 ${theme === 'light' ? 'bg-amber-800 text-amber-100' : 'bg-amber-900 text-amber-200'} text-center`}>
          <p>&copy; {new Date().getFullYear()} MuseMate. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

export default function WrappedEnhancedLandingPage() {
  return (
    <ThemeProvider>
      <EnhancedLandingPage />
    </ThemeProvider>
  )
}
