import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CirclePlus, Pencil, Trash, Search } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Training() {
  const [trainings, setTrainings] = useState([])
  const [filteredTrainings, setFilteredTrainings] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTraining, setEditingTraining] = useState(null)
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [institution, setInstitution] = useState('')
  const [status, setStatus] = useState('active')
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [trainingToDelete, setTrainingToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'info' })

  useEffect(() => {
    fetchTrainings()
  }, [])

  useEffect(() => {
    filterTrainings()
  }, [trainings, searchTerm])

  const fetchTrainings = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.get('http://127.0.0.1:8000/api/training', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      if (response.data.status === 'success') {
        setTrainings(response.data.data)
      } else {
        showAlert(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error fetching trainings:', error)
      showAlert("No se pudieron cargar las capacitaciones. Por favor, intente nuevamente.", 'error')
    }
  }

  const filterTrainings = () => {
    const filtered = trainings.filter(training =>
      training.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.institution.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredTrainings(filtered)
  }

  const showAlert = (message, type = 'info') => {
    setAlertInfo({ show: true, message, type })
    setTimeout(() => setAlertInfo({ show: false, message: '', type: 'info' }), 5000)
  }

  const handleOpenModal = (training = null) => {
    if (training) {
      setEditingTraining(training)
      setDescription(training.description)
      setLevel(training.level)
      setDateFrom(training.date_from)
      setDateTo(training.date_to)
      setInstitution(training.institution)
      setStatus(training.status)
    } else {
      setEditingTraining(null)
      setDescription('')
      setLevel('')
      setDateFrom('')
      setDateTo('')
      setInstitution('')
      setStatus('active')
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTraining(null)
    setDescription('')
    setLevel('')
    setDateFrom('')
    setDateTo('')
    setInstitution('')
    setStatus('active')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = sessionStorage.getItem('token')
    const data = { description, level, date_from: dateFrom, date_to: dateTo, institution, status }
    try {
      let response
      if (editingTraining) {
        response = await axios.put(`http://127.0.0.1:8000/api/training/${editingTraining.training_id}`, data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/training', data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      }
      if (response.data.status === 'success') {
        await fetchTrainings()
        handleCloseModal()
        showAlert(response.data.message, 'success')
      } else {
        showAlert(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error submitting training:', error)
      showAlert("No se pudo guardar la capacitación. Por favor, intente nuevamente.", 'error')
    }
  }

  const handleDeleteConfirmation = (id) => {
    setTrainingToDelete(id)
    setIsDeleteAlertOpen(true)
  }

  const handleDelete = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.delete(`http://127.0.0.1:8000/api/training/${trainingToDelete}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      if (response.data.status === 'success') {
        setTrainings(prevTrainings => 
          prevTrainings.filter(training => training.training_id !== trainingToDelete)
        )
        setIsDeleteAlertOpen(false)
        setTrainingToDelete(null)
        showAlert(response.data.message, 'success')
      } else {
        showAlert(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error deleting training:', error)
      showAlert("No se pudo eliminar la capacitación. Por favor, intente nuevamente.", 'error')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Capacitaciones</CardTitle>
      </CardHeader>
      <CardContent>
        {alertInfo.show && (
          <Alert variant={alertInfo.type === 'error' ? 'destructive' : 'default'} className="mb-4">
            <AlertDescription>{alertInfo.message}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-between items-center mb-4">
          <Button 
            className="bg-[#219ebc] hover:bg-[#1d8aa8]"
            onClick={() => handleOpenModal()}
          >
            <CirclePlus className="mr-2 h-4 w-4" /> Agregar Capacitación
          </Button>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar capacitaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 w-full"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {filteredTrainings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No hay capacitaciones registradas.</p>
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Nivel Académico</TableHead>
                  <TableHead>Fecha Desde</TableHead>
                  <TableHead>Fecha Hasta</TableHead>
                  <TableHead>Institución</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainings.map((training) => (
                  <TableRow key={training.training_id}>
                    <TableCell>{training.description}</TableCell>
                    <TableCell>{training.level}</TableCell>
                    <TableCell>{training.date_from}</TableCell>
                    <TableCell>{training.date_to}</TableCell>
                    <TableCell>{training.institution}</TableCell>
                    <TableCell>{training.status}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => handleOpenModal(training)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteConfirmation(training.training_id)}
                      >
                        <Trash className="h-4 w-4 mr-1" /> Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTraining ? 'Editar' : 'Agregar'} Capacitación</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input 
                  id="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción de la capacitación"
                />
              </div>
              <div>
                <Label htmlFor="level">Nivel Académico</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Seleccione el nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="degree">Grado</SelectItem>
                    <SelectItem value="postgraduate">Post-grado</SelectItem>
                    <SelectItem value="mastery">Maestría</SelectItem>
                    <SelectItem value="doctorate">Doctorado</SelectItem>
                    <SelectItem value="technical">Técnico</SelectItem>
                    <SelectItem value="management">Gestión</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFrom">Fecha Desde</Label>
                <Input 
                  id="dateFrom" 
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateTo">Fecha Hasta</Label>
                <Input 
                  id="dateTo" 
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
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
                <Label htmlFor="status">Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Seleccione el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#219ebc] hover:bg-[#1d8aa8]">
                  {editingTraining ? 'Actualizar' : 'Agregar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de que desea eliminar esta capacitación?</AlertDialogTitle>
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