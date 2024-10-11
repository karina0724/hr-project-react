import { useState, useEffect, memo } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CirclePlus, Pencil, Trash, Search } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

function Competencies() {

  const [competencies, setCompetencies] = useState([])
  const [filteredCompetencies, setFilteredCompetencies] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompetency, setEditingCompetency] = useState(null)
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [competencyToDelete, setCompetencyToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'info' })

  useEffect(() => {
    fetchCompetencies()
  }, [])

  useEffect(() => {
    filterCompetencies()
  }, [competencies, searchTerm])

  const fetchCompetencies = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.get('http://127.0.0.1:8000/api/competencies', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      if (response.data.status === 'success') {
        setCompetencies(response.data.data)
      } else {
        showAlert(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error fetching competencies:', error)
      showAlert("No se pudieron cargar las competencias. Por favor, intente nuevamente.", 'error')
    }
  }

  const filterCompetencies = () => {
    const filtered = competencies.filter(competency =>
      competency.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competency.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCompetencies(filtered)
  }

  const showAlert = (message, type = 'info') => {
    setAlertInfo({ show: true, message, type })
    setTimeout(() => setAlertInfo({ show: false, message: '', type: 'info' }), 5000)
  }

  const handleOpenModal = (competency = null) => {
    if (competency) {
      setEditingCompetency(competency)
      setType(competency.type)
      setDescription(competency.description)
    } else {
      setEditingCompetency(null)
      setType('')
      setDescription('')
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCompetency(null)
    setType('')
    setDescription('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = sessionStorage.getItem('token')
    const data = { type, description, status: 'active' }
    try {
      let response
      if (editingCompetency) {
        response = await axios.put(`http://127.0.0.1:8000/api/competencies/${editingCompetency.competence_id}`, data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/competencies', data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      }
      if (response.data.status === 'success') {
        await fetchCompetencies()
        handleCloseModal()
        showAlert(response.data.message, 'success')
      } else {
        showAlert(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error submitting competency:', error)
      showAlert("No se pudo guardar la competencia. Por favor, intente nuevamente.", 'error')
    }
  }

  const handleDeleteConfirmation = (id) => {
    setCompetencyToDelete(id)
    setIsDeleteAlertOpen(true)
  }

  const handleDelete = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.delete(`http://127.0.0.1:8000/api/competencies/${competencyToDelete}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      if (response.data.status === 'success') {
        await fetchCompetencies() // Fetch updated competencies from the server
        setIsDeleteAlertOpen(false)
        setCompetencyToDelete(null)
        showAlert(response.data.message, 'success')
      } else {
        showAlert(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error deleting competency:', error)
      showAlert("No se pudo eliminar la competencia. Por favor, intente nuevamente.", 'error')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Competencias</CardTitle>
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
            <CirclePlus className="mr-2 h-4 w-4" /> Agregar Competencia
          </Button>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar competencias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 w-full"
            />
          </div>
        </div>
        {filteredCompetencies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No hay competencias registradas.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompetencies.map((competency) => (
                <TableRow key={competency.competence_id}>
                  <TableCell>{competency.type}</TableCell>
                  <TableCell>{competency.description}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => handleOpenModal(competency)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteConfirmation(competency.competence_id)}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCompetency ? 'Editar' : 'Agregar'} Competencia</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soft">Blanda</SelectItem>
                    <SelectItem value="technical">Técnica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descripción de la competencia" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#219ebc] hover:bg-[#1d8aa8]">
                  {editingCompetency ? 'Actualizar' : 'Agregar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de que desea eliminar esta competencia?</AlertDialogTitle>
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

export default memo(Competencies);