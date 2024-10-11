import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function TopBar({ user, onLogout }) {
  console.log('TopBar', user)
  // If user is not defined, render a placeholder or loading state
  if (!user || !user.data) {
    return (
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
          <div className="font-bold text-lg">HR System</div>
          <div className="ml-auto">
            <Button variant="ghost">
              Cargando...
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const userData = user.data.user
  console.log('userData', userData)
  const displayName = userData.name ?? userData.username ?? 'Usuario'
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <div className="font-bold text-lg">HR System</div>
        <div className="ml-auto flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            <span className="font-medium">{displayName}</span>
            <span className="mx-1">•</span>
            <span className="text-gray-500">{userData.role || '-'}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full p-0 hover:bg-gray-100 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData.profile_picture} alt={displayName} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userData.email || 'Correo no disponible'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="focus:bg-gray-100 focus:outline-none">
                Mi perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-gray-100 focus:outline-none">
                Ajustes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="focus:bg-gray-100 focus:outline-none" 
                onClick={onLogout}
              >
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}