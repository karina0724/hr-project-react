import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { CirclePlus, Pencil, Trash, Search } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formatCurrency = (value) => {
  const number = parseFloat(value)
  if (isNaN(number)) return 'RD$ 0.00'
  return `RD$ ${number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
}

export default function Positions() {
  const [positions, setPositions] = useState([])
  const [filteredPositions, setFilteredPositions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState(null)
  const [name, setName] = useState('')
  const [riskLevel, setRiskLevel] = useState('')
  const [minSalary, setMinSalary] = useState('')
  const [maxSalary, setMaxSalary] = useState('')
  const [status, setStatus] = useState('active')
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [positionToDelete, setPositionToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'info' })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchPositions()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      filterPositions()
    } else {
      setFilteredPositions(positions)
    }
  }, [positions, searchTerm])

  const fetchPositions = async () => {
    setIsLoading(true)
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.get('http://127.0.0.1:8000/api/positions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.data.status) {
        setPositions(response.data.data)
        setFilteredPositions(response.data.data)
        showAlert("Posiciones recuperadas correctamente.", 'success')
      } else {
        showAlert(response.data.message || "Error al recuperar las posiciones.", 'error')
      }
    } catch (error) {
      console.error('Error fetching positions:', error)
      showAlert("No se pudieron cargar los puestos. Por favor, intente nuevamente.", 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const filterPositions = () => {
    if (!positions) return
    const filtered = positions.filter(position =>
      position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (position.risk_level && position.risk_level.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (position.status && position.status.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredPositions(filtered)
  }

  const showAlert = (message, type = 'info') => {
    setAlertInfo({ show: true, message, type })
    setTimeout(() => setAlertInfo({ show: false, message: '', type: 'info' }), 5000)
  }

  const handleOpenModal = (position = null) => {
    if (position) {
      setEditingPosition(position)
      setName(position.name)
      setRiskLevel(position.risk_level || '')
      setMinSalary(position.min_salary ? position.min_salary.toString() : '')
      setMaxSalary(position.max_salary ? position.max_salary.toString() : '')
      setStatus(position.status || 'active')
    } else {
      setEditingPosition(null)
      setName('')
      setRiskLevel('')
      setMinSalary('')
      setMaxSalary('')
      setStatus('active')
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPosition(null)
    setName('')
    setRiskLevel('')
    setMinSalary('')
    setMaxSalary('')
    setStatus('active')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const token = sessionStorage.getItem('token')
    const data = { 
      name, 
      risk_level: riskLevel, 
      min_salary: minSalary ? parseFloat(minSalary) : null, 
      max_salary: maxSalary ? parseFloat(maxSalary) : null, 
      status 
    }
    try {
      let response
      if (editingPosition) {
        response = await axios.put(`http://127.0.0.1:8000/api/positions/${editingPosition.position_id}`, data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/positions', data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      }
      if (response.data.status) {
        await fetchPositions()
        handleCloseModal()
        showAlert(response.data.message, 'success')
      } else {
        showAlert(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error submitting position:', error)
      showAlert(error.response?.data?.message || "No se pudo guardar el puesto. Por favor, intente nuevamente.", 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConfirmation = (id) => {
    setPositionToDelete(id)
    setIsDeleteAlertOpen(true)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.delete(`http://127.0.0.1:8000/api/positions/${positionToDelete}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      if (response.data.status) {
        await fetchPositions()
        setIsDeleteAlertOpen(false)
        setPositionToDelete(null)
        showAlert(response.data.message, 'success')
      } else {
        showAlert(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error deleting position:', error)
      showAlert("No se pudo eliminar el puesto. Por favor, intente nuevamente.", 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Puestos</CardTitle>
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
            <CirclePlus className="mr-2 h-4 w-4" /> Agregar Puesto
          </Button>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar puestos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 w-full"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Cargando...</p>
            </div>
          ) : filteredPositions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No hay puestos registrados.</p>
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Nivel de Riesgo</TableHead>
                  <TableHead>Salario Mínimo</TableHead>
                  <TableHead>Salario Máximo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.map((position) => (
                  <TableRow key={position.position_id}>
                    <TableCell>{position.name}</TableCell>
                    <TableCell>{position.risk_level || 'N/A'}</TableCell>
                    <TableCell>{position.min_salary ? formatCurrency(position.min_salary) : 'N/A'}</TableCell>
                    <TableCell>{position.max_salary ? formatCurrency(position.max_salary) : 'N/A'}</TableCell>
                    <TableCell>{position.status || 'N/A'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => handleOpenModal(position)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteConfirmation(position.position_id)}
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
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingPosition ? 'Editar' : 'Agregar'} Puesto</DialogTitle>
              <DialogDescription>
                Complete los detalles del puesto a continuación.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del puesto"
                />
              </div>
              <div>
                <Label htmlFor="riskLevel">Nivel de Riesgo</Label>
                <Select value={riskLevel} onValueChange={setRiskLevel}>
                  <SelectTrigger id="riskLevel">
                    <SelectValue placeholder="Seleccione el nivel de riesgo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="medium">Medio</SelectItem>
                    <SelectItem value="low">Bajo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="minSalary">Salario Mínimo (RD$)</Label>
                <Input 
                  id="minSalary" 
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  placeholder="Salario mínimo"
                />
              </div>
              <div>
                <Label htmlFor="maxSalary">Salario Máximo (RD$)</Label>
                <Input 
                  id="maxSalary" 
                  type="number"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  placeholder="Salario máximo"
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
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#219ebc] hover:bg-[#1d8aa8]">
                  {editingPosition ? 'Actualizar' : 'Agregar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog open={isDeleteAlertOpen}   onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de que desea eliminar este puesto?</AlertDialogTitle>
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