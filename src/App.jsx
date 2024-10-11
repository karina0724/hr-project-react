import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import axios from 'axios'
import Login from './Login'
import Dashboard from './Dashboard'
import Competencies from './Competencies'
import Languages from './Languages'
import Training from './Training'
import Positions from './Positions'
import Candidates from './Candidates'
import Employees from './Employees'
import WorkExperience from './WorkExperience'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      fetchUserData(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserData = async (authToken) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/user/', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      })
      setUser(response.data)
    } catch (error) {
      console.error('Error fetching user data:', error)
      handleLogout()
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData, authToken) => {
    console.log('Login handler called with:', userData, authToken)
    setUser(userData)
    setToken(authToken)
    sessionStorage.setItem('token', authToken)
  }

  const handleLogout = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/logout/', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      setUser(null)
      setToken(null)
      sessionStorage.removeItem('token')
    }
  }

  const ProtectedRoute = ({ children, allowedRoles }) => {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
      if (!loading && !token) {
        navigate('/login', { state: { from: location }, replace: true })
      } else if (user && user.data && user.data.user) {
        const userRole = user.data.user.role
        if (allowedRoles && !allowedRoles.includes(userRole)) {
          navigate('/', { replace: true })
        }
      }
    }, [user, token, loading, allowedRoles, navigate, location])

    if (loading) return <div>Loading...</div>
    if (!token) return null
    return children
  }

  return (
    <GoogleOAuthProvider clientId="1073955226979-ff01a2e6ba8548d50rn5lvd0f5e9197g.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          >
            <Route path="competencies" element={<ProtectedRoute allowedRoles={['recruiter']}><Competencies /></ProtectedRoute>} />
            <Route path="languages" element={<ProtectedRoute allowedRoles={['recruiter']}><Languages /></ProtectedRoute>} />
            <Route path="training" element={<ProtectedRoute allowedRoles={['recruiter']}><Training /></ProtectedRoute>} />
            <Route path="positions" element={<ProtectedRoute allowedRoles={['recruiter']}><Positions /></ProtectedRoute>} />
            <Route path="candidates" element={<ProtectedRoute allowedRoles={['recruiter', 'candidate']}><Candidates /></ProtectedRoute>} />
            <Route path="employees" element={<ProtectedRoute allowedRoles={['recruiter']}><Employees /></ProtectedRoute>} />
            <Route path="work-experience" element={<ProtectedRoute allowedRoles={['recruiter', 'candidate']}><WorkExperience /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App