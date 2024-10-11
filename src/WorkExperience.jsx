import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { CirclePlus, Pencil, Trash, Search } from 'lucide-react'

export default function WorkExperience() {
  const [experiences, setExperiences] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [experienceToDelete, setExperienceToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [userType, setUserType] = useState('')
  const [userName, setUserName] = useState('')
  const [institution, setInstitution] = useState('')
  const [position, setPosition] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [salary, setSalary] = useState('')

  // Mock data for employees and candidates
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Juan Pérez', type: 'Empleado' },
    { id: 2, name: 'María García', type: 'Empleado' },
    { id: 3, name: 'Carlos López', type: 'Empleado' },
  ])
  const [candidates, setCandidates] = useState([
    { id: 1, name: 'Ana Rodríguez', type: 'Candidato' },
    { id: 2, name: 'Luis Martínez', type: 'Candidato' },
    { id: 3, name: 'Elena Sánchez', type: 'Candidato' },
  ])

  useEffect(() => {
    // Simulating fetching data from an API
    setExperiences([
      { id: 1, userType: 'Empleado', userName: 'Juan Pérez', institution: 'Tech Co', position: 'Desarrollador Frontend', startDate: '2020-01-01', endDate: '2022-12-31', salary: 50000 },
      { id: 2, userType: 'Candidato', userName: 'Ana Rodríguez', institution: 'Innovate Inc', position: 'Diseñador UX', startDate: '2019-06-01', endDate: '2021-05-31', salary: 45000 },
      { id: 3, userType: 'Empleado', userName: 'María García', institution: 'Data Systems', position: 'Analista de Datos', startDate: '2018-03-15', endDate: '2023-03-14', salary: 55000 },
    ])
  }, [])

  const handleOpenModal = (experience = null) => {
    if (experience) {
      setEditingExperience(experience)
      setUserType(experience.userType)
      setUserName(experience.userName)
      setInstitution(experience.institution)
      setPosition(experience.position)
      setStartDate(experience.startDate)
      setEndDate(experience.endDate)
      setSalary(experience.salary.toString())
    } else {
      setEditingExperience(null)
      resetForm()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingExperience(null)
    resetForm()
  }

  const resetForm = () => {
    setUserType('')
    setUserName('')
    setInstitution('')
    setPosition('')
    setStartDate('')
    setEndDate('')
    setSalary('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newExperience = {
      id: editingExperience ? editingExperience.id : Date.now(),
      userType,
      userName,
      institution,
      position,
      startDate,
      endDate,
      salary: parseFloat(salary),
    }
    if (editingExperience) {
      setExperiences(experiences.map(e => e.id === editingExperience.id ? newExperience : e))
    } else {
      setExperiences([...experiences, newExperience])
    }
    handleCloseModal()
  }

  const handleDeleteConfirmation = (id) => {
    setExperienceToDelete(id)
    setIsDeleteAlertOpen(true)
  }

  const handleDelete = () => {
    setExperiences(experiences.filter(e => e.id !== experienceToDelete))
    setIsDeleteAlertOpen(false)
    setExperienceToDelete(null)
  }

  const filteredExperiences = experiences.filter(experience => {
    return experience.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
           experience.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
           experience.userName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestión de Experiencia Laboral</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <Button 
            className="bg-[#219ebc] hover:bg-[#1d8aa8] text-white w-full md:w-auto"
            onClick={() => handleOpenModal()}
          >
            <CirclePlus className="mr-2 h-4 w-4" /> Agregar Experiencia
          </Button>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar experiencias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Usuario</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Institución</TableHead>
                <TableHead>Posición</TableHead>
                <TableHead>Fecha de Inicio</TableHead>
                <TableHead>Fecha de Fin</TableHead>
                <TableHead>Salario</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExperiences.map((experience) => (
                <TableRow key={experience.id}>
                  <TableCell>{experience.userType}</TableCell>
                  <TableCell>{experience.userName}</TableCell>
                  <TableCell>{experience.institution}</TableCell>
                  <TableCell>{experience.position}</TableCell>
                  <TableCell>{experience.startDate}</TableCell>
                  <TableCell>{experience.endDate}</TableCell>
                  <TableCell>RD$ {experience.salary.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => handleOpenModal(experience)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteConfirmation(experience.id)}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExperience ? 'Editar' : 'Agregar'} Experiencia Laboral</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userType">Tipo de Usuario</Label>
                  <Select value={userType} onValueChange={(value) => {
                    setUserType(value)
                    setUserName('')
                  }}>
                    <SelectTrigger id="userType">
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Empleado">Empleado</SelectItem>
                      <SelectItem value="Candidato">Candidato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="userName">Nombre</Label>
                  <Select value={userName} onValueChange={setUserName}>
                    <SelectTrigger id="userName">
                      <SelectValue placeholder="Seleccione el nombre" />
                    </SelectTrigger>
                    <SelectContent>
                      {userType === 'Empleado' 
                        ? employees.map(employee => (
                            <SelectItem key={employee.id} value={employee.name}>{employee.name}</SelectItem>
                          ))
                        : candidates.map(candidate => (
                            <SelectItem key={candidate.id} value={candidate.name}>{candidate.name}</SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="institution">Institución</Label>
                <Input 
                  id="institution" 
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Nombre de la institución"
                />
              </div>
              <div>
                <Label htmlFor="position">Posición</Label>
                <Input 
                  id="position" 
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Cargo ocupado"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Fecha de Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Fecha de Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="salary">Salario (RD$)</Label>
                <Input 
                  id="salary" 
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="Salario"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#219ebc] hover:bg-[#1d8aa8] text-white">
                  {editingExperience ? 'Actualizar' : 'Agregar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de que desea eliminar esta experiencia laboral?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}