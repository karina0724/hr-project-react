import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { UserPlus, Users, Briefcase, Globe, BookOpen, Award, FileText } from 'lucide-react'
import TopBar from './TopBar'

export default function Dashboard({ user: initialUser, onLogout }) {
  const [user, setUser] = useState(initialUser)
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { name: 'Competencias', path: 'competencies', icon: Award, role: 'recruiter' },
    { name: 'Idiomas', path: 'languages', icon: Globe, role: 'recruiter' },
    { name: 'Capacitaciones', path: 'training', icon: BookOpen, role: 'recruiter' },
    { name: 'Puestos', path: 'positions', icon: Briefcase, role: 'recruiter' },
    { name: 'Candidatos', path: 'candidates', icon: Users, role: 'all' },
    { name: 'Empleados', path: 'employees', icon: UserPlus, role: 'recruiter' },
    { name: 'Experiencia Laboral', path: 'work-experience', icon: FileText, role: 'all' },
  ]

  // Ensure we're using the correct user object structure
  const userData = user?.data?.user || user

  const visibleNavItems = navItems.filter(item => item.role === 'all' || userData?.role === item.role)
  const firstVisiblePath = visibleNavItems.length > 0 ? visibleNavItems[0].path : ''

  useEffect(() => {
    if (location.pathname === '/' && firstVisiblePath) {
      navigate(firstVisiblePath)
    }
  }, [location.pathname, firstVisiblePath, navigate])

  if (!userData) {
    return null // or a loading indicator
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar user={user} onLogout={onLogout} />
      <div className="flex">
        <aside className="w-64 bg-white h-screen p-4">
          <nav className="space-y-2">
            {visibleNavItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center w-full px-2 py-2 text-sm font-medium rounded-md ${
                    isActive || (index === 0 && location.pathname === '/')
                      ? "bg-[#219ebc] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
                end={index === 0}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4">
          <h2 className="text-xl font-bold mb-4">Panel de control de reclutamiento y selección</h2>
          <Outlet />
          <footer className="mt-20 text-center text-sm text-gray-500">
            <p>&copy; 2024 HR System. Todos los derechos reservados. Desarrollado por Ing. Karina Montero Leonardo.</p>
          </footer>
        </main>
      </div>
    </div>
  )
}