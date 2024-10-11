import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from "jwt-decode"
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const navigate = useNavigate()

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse?.credential)

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', {
        email: decoded.email,
        auth_type: 'google',
        google_id: decoded.sub,
        profile_picture: decoded.picture,
        username: decoded.name,
        role: 'candidate'
      })
     
      console.log('Google login response:', response.data)
      onLogin(response.data, response.data.data.token)
      navigate('/')
    } catch (error) {
      console.error('Google login failed:', error)
      setGeneralError('Google login failed. Please try again.')
    }
  }

  const handleGoogleLoginError = () => {
    console.log('Google Login Failed')
    setGeneralError('Google login failed. Please try again.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setGeneralError('')
    setSuccessMessage('')

    if (isLogin) {
      // Login process
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/login/', {
          email,
          password
        }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })
        console.log('Login response:', response.data)
        if (response.data.status === 'success') {
          onLogin(response.data, response.data.data.token)
          navigate('/')
        } else {
          setGeneralError(response.data.message || 'Login failed. Please try again.')
        }
      } catch (error) {
        console.error('Login error:', error.response)
        if (error.response && error.response.data && error.response.data.message) {
          setGeneralError(error.response.data.message)
        } else {
          setGeneralError('An error occurred during login. Please try again.')
        }
      }
    } else {
      // Registration process
      const data = {
        email,
        password,
        username,
        role,
        auth_type: 'local',
        status: 'active',
        ...(role === 'recruiter' ? { verificationToken } : {}),
      }

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/register/', data, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })
        setSuccessMessage('Registro exitoso. Por favor ingrese sus credenciales para iniciar sesion.')
        setIsLogin(true)
        setEmail('')  
        setPassword('')
        setUsername('')
        setRole('')
        setVerificationToken('')
      } catch (error) {
        if (error.response && error.response.data && error.response.data.errors) {
          setErrors(error.response.data.errors)
        } else if (error.response && error.response.data && error.response.data.message) {
          setGeneralError(error.response.data.message)
        } else {
          setGeneralError('An error occurred during registration. Please try again.')
        }
      }
    }
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-[#f0f4f8] flex flex-col items-center justify-center p-8">
        <div className="w-32 h-32 rounded-full overflow-hidden mb-6 shadow-md">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZDXl09g9oNMvuzDU8bfbVYe3er2Hzt.png"
            alt="HR System"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-[#219ebc] text-3xl font-semibold mb-4">HR System</h1>
        <p className="text-[#4a6572] text-lg text-center max-w-md italic">
          Gestiona tus recursos humanos de manera eficiente y efectiva con nuestro sistema integral.
        </p>
      </div>
      <div className="w-1/2 bg-white flex items-center justify-center">
        <Card className="w-[350px] border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[#219ebc]">
              {isLogin ? 'Iniciar sesión' : 'Registrarse'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Accede a tu cuenta' : 'Crea una nueva cuenta'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                {!isLogin && (
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="username">Nombre</Label>
                    <Input 
                      id="username" 
                      placeholder="Ingrese su nombre completo" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    {errors.username && <Alert variant="destructive"><AlertDescription>{errors.username[0]}</AlertDescription></Alert>}
                  </div>
                )}
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input 
                    id="email" 
                    placeholder="correo@hrsystem.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <Alert variant="destructive"><AlertDescription>{errors.email[0]}</AlertDescription></Alert>}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input 
                    id="password" 
                    placeholder="********" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && <Alert variant="destructive"><AlertDescription>{errors.password[0]}</AlertDescription></Alert>}
                </div>
                {!isLogin && (
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="role">Rol</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candidate">Candidato</SelectItem>
                        <SelectItem value="recruiter">Reclutador</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && <Alert variant="destructive"><AlertDescription>{errors.role[0]}</AlertDescription></Alert>}
                  </div>
                )}
                {!isLogin && role === 'recruiter' && (
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="verificationToken">Token de Verificación</Label>
                    <Input 
                      id="verificationToken" 
                      placeholder="Ingrese el token de verificación" 
                      value={verificationToken}
                      onChange={(e) => setVerificationToken(e.target.value)}
                    />
                    {errors.verificationToken && <Alert variant="destructive"><AlertDescription>{errors.verificationToken[0]}</AlertDescription></Alert>}
                  </div>
                )}
              </div>
              {generalError && <Alert variant="destructive" className="mt-4"><AlertDescription>{generalError}</AlertDescription></Alert>}
              {successMessage && <Alert variant="success" className="mt-4"><AlertDescription>{successMessage}</AlertDescription></Alert>}
              <Button className="w-full bg-[#219ebc] hover:bg-[#1d8aa8] mt-4" type="submit">
                {isLogin ? 'Iniciar sesión' : 'Registrarse'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Separator className="my-4" />
            <div className="w-full">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                useOneTap
                shape="rectangular"
                theme="outline"
                text="continue_with"
                locale="es"
              />
            </div>
            <p className="mt-4 text-sm text-center">
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
              <Button
                variant="link"
                className="pl-1 text-[#219ebc]"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setErrors({})
                  setGeneralError('')
                  setSuccessMessage('')
                }}
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}