import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { CirclePlus, Pencil, Trash, Search, Download, Calendar } from 'lucide-react'
import { jsPDF } from "jspdf"
import "jspdf-autotable"

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [candidates, setCandidates] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Form state
  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [name, setName] = useState('')
  const [startDateEmployee, setStartDateEmployee] = useState('')
  const [department, setDepartment] = useState('')
  const [position, setPosition] = useState('')
  const [salary, setSalary] = useState('')
  const [status, setStatus] = useState('Activo')

  useEffect(() => {
    // Simulating fetching data from an API
    setEmployees([
      { id: 1, documentNumber: '001-0000000-0', documentType: 'Cédula', name: 'Juan Pérez', startDate: '2023-01-01', department: 'IT', position: 'Desarrollador Frontend', salary: 50000, status: 'Activo' },
      { id: 2, documentNumber: '002-0000000-0', documentType: 'Cédula', name: 'María García', startDate: '2023-02-15', department: 'RRHH', position: 'Gerente de Recursos Humanos', salary: 75000, status: 'Activo' },
      { id: 3, documentNumber: '003-0000000-0', documentType: 'Pasaporte', name: 'Carlos Rodríguez', startDate: '2023-03-10', department: 'Ventas', position: 'Representante de Ventas', salary: 45000, status: 'Activo' },
      { id: 4, documentNumber: '004-0000000-0', documentType: 'Cédula', name: 'Ana Martínez', startDate: '2023-04-05', department: 'Marketing', position: 'Especialista en Marketing Digital', salary: 55000, status: 'Activo' },
      { id: 5, documentNumber: '005-0000000-0', documentType: 'Cédula', name: 'Luis Morales', startDate: '2023-05-20', department: 'Finanzas', position: 'Contador', salary: 60000, status: 'Deshabilitado' },
    ])
    setCandidates([
      { id: 1, documentNumber: '001-0000000-0', documentType: 'Cédula', name: 'Juan Pérez' },
      { id: 2, documentNumber: '002-0000000-0', documentType: 'Cédula', name: 'María García' },
      { id: 3, documentNumber: '003-0000000-0', documentType: 'Pasaporte', name: 'Carlos Rodríguez' },
      { id: 4, documentNumber: '004-0000000-0', documentType: 'Cédula', name: 'Ana Martínez' },
      { id: 5, documentNumber: '005-0000000-0', documentType: 'Cédula', name: 'Luis Morales' },
      { id: 6, documentNumber: '006-0000000-0', documentType: 'Pasaporte', name: 'Elena Sánchez' },
    ])
  }, [])

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee)
      setSelectedCandidate('')
      setDocumentNumber(employee.documentNumber)
      setDocumentType(employee.documentType)
      setName(employee.name)
      setStartDateEmployee(employee.startDate)
      setDepartment(employee.department)
      setPosition(employee.position)
      setSalary(employee.salary.toString())
      setStatus(employee.status)
    } else {
      setEditingEmployee(null)
      resetForm()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingEmployee(null)
    resetForm()
  }

  const resetForm = () => {
    setSelectedCandidate('')
    setDocumentNumber('')
    setDocumentType('')
    setName('')
    setStartDateEmployee('')
    setDepartment('')
    setPosition('')
    setSalary('')
    setStatus('Activo')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newEmployee = {
      id: editingEmployee ? editingEmployee.id : Date.now(),
      documentNumber,
      documentType,
      name,
      startDate: startDateEmployee,
      department,
      position,
      salary: parseFloat(salary),
      status,
    }
    if (editingEmployee) {
      setEmployees(employees.map(e => e.id === editingEmployee.id ? newEmployee : e))
    } else {
      setEmployees([...employees, newEmployee])
    }
    handleCloseModal()
  }

  const handleDeleteConfirmation = (id) => {
    setEmployeeToDelete(id)
    setIsDeleteAlertOpen(true)
  }

  const handleDelete = () => {
    setEmployees(employees.filter(e => e.id !== employeeToDelete))
    setIsDeleteAlertOpen(false)
    setEmployeeToDelete(null)
  }

  const handleCandidateChange = (candidateId) => {
    const selectedCandidate = candidates.find(c => c.id.toString() === candidateId)
    if (selectedCandidate) {
      setSelectedCandidate(candidateId)
      setDocumentNumber(selectedCandidate.documentNumber)
      setDocumentType(selectedCandidate.documentType)
      setName(selectedCandidate.name)
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDateRange = (!startDate || employee.startDate >= startDate) &&
                             (!endDate || employee.startDate <= endDate)
    return matchesSearch && matchesDateRange
  })

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.autoTable({
      head: [['Nombre', 'Documento', 'Fecha de Ingreso', 'Departamento', 'Puesto', 'Salario', 'Estado']],
      body: filteredEmployees.map(e => [
        e.name,
        `${e.documentType}: ${e.documentNumber}`,
        e.startDate,
        e.department,
        e.position,
        `$${e.salary.toLocaleString()}`,
        e.status
      ]),
    })
    doc.save('empleados.pdf')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Empleados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <Button 
            className="bg-[#219ebc] hover:bg-[#1d8aa8]"
            onClick={() => handleOpenModal()}
          >
            <CirclePlus className="mr-2 h-4 w-4" /> Agregar Empleado
          </Button>
          <Button onClick={downloadPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Descargar PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Label htmlFor="search" className="mb-2 block">Buscar</Label>
            <Search className="absolute left-2 top-[calc(50%+0.5rem)] transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              type="text"
              placeholder="Buscar empleados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2"
            />
          </div>
          <div className="relative">
            <Label htmlFor="startDate" className="mb-2 block">Desde</Label>
            <Calendar className="absolute left-2 top-[calc(50%+0.5rem)] transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-8 pr-4 py-2"
            />
          </div>
          <div className="relative">
            <Label htmlFor="endDate" className="mb-2 block">Hasta</Label>
            <Calendar className="absolute left-2 top-[calc(50%+0.5rem)] transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-8 pr-4 py-2"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>No. Identificación</TableHead>
                <TableHead>Fecha de Ingreso</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Puesto</TableHead>
                <TableHead>Salario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.documentNumber}</TableCell>
                  <TableCell>{employee.startDate}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>${employee.salary.toLocaleString()}</TableCell>
                  <TableCell>{employee.status}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => handleOpenModal(employee)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteConfirmation(employee.id)}
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
              <DialogTitle>{editingEmployee ? 'Editar' : 'Agregar'} Empleado</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="candidate">Candidato</Label>
                  <Select value={selectedCandidate} onValueChange={handleCandidateChange}>
                    <SelectTrigger id="candidate">
                      <SelectValue placeholder="Seleccione un candidato" />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id.toString()}>{candidate.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="documentNumber">Documento Personal</Label>
                  <Input 
                    id="documentNumber" 
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="Número de documento"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentType">Tipo de Identificación</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="documentType">
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cédula">Cédula</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre completo"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2  gap-4">
                <div>
                  <Label htmlFor="startDate">Fecha de Ingreso</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDateEmployee}
                    onChange={(e) => setStartDateEmployee(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <Input  
                    id="department" 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Departamento"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Puesto</Label>
                  <Input 
                    id="position" 
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Puesto"
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salario</Label>
                  <Input 
                    id="salary" 
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="Salario"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Seleccione el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Deshabilitado">Deshabilitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#219ebc] hover:bg-[#1d8aa8]">
                  {editingEmployee ? 'Actualizar' : 'Agregar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de que desea eliminar este empleado?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}