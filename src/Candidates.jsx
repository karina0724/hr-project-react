import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { CirclePlus, Pencil, Trash, Search, X, Award, Check } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

const API_URL = 'http://127.0.0.1:8000/api'

export default function Candidates() {
  const [candidates, setCandidates] = useState([])
  const [positions, setPositions] = useState([])
  const [competencies, setCompetencies] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isSelectAlertOpen, setIsSelectAlertOpen] = useState(false)
  const [candidateToDelete, setCandidateToDelete] = useState(null)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'info' })

  // Form state
  const [formData, setFormData] = useState({
    desired_position: '',
    id_number: '',
    id_type: '',
    name: '',
    department: '',
    desired_salary: '',
    main_competencies: '',
    main_trainings: '',
    recommended_by: '',
    status: 'active'
  })

  useEffect(() => {
    fetchCandidates()
    fetchPositions()
    fetchCompetencies()
  }, [])

  const fetchCandidates = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.get(`${API_URL}/candidates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      if (response.data.status) {
        setCandidates(response.data.data)
      } else {
        showAlert(response.data.message || "Error al recuperar los candidatos.", 'error')
      }
    } catch (error) {
      console.error('Error fetching candidates:', error)
      showAlert("No se pudieron cargar los candidatos. Por favor, intente nuevamente.", 'error')
    }
  }

  const fetchPositions = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.get(`${API_URL}/positions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      if (response.data.status) {
        setPositions(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching positions:', error)
    }
  }

  const fetchCompetencies = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.get(`${API_URL}/competencies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      if (response.data.status) {
        setCompetencies(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching competencies:', error)
    }
  }

  const showAlert = (message, type = 'info') => {
    setAlertInfo({ show: true, message, type })
    setTimeout(() => setAlertInfo({ show: false, message: '', type: 'info' }), 5000)
  }

  const handleOpenModal = (candidate = null) => {
    if (candidate) {
      setEditingCandidate(candidate)
      setFormData({
        desired_position: candidate.desired_position,
        id_number: candidate.id_number,
        id_type: candidate.id_type,
        name: candidate.name,
        department: candidate.department,
        desired_salary: candidate.desired_salary,
        main_competencies: candidate.main_competencies,
        main_trainings: candidate.main_trainings,
        recommended_by: candidate.recommended_by,
        status: candidate.status
      })
    } else {
      setEditingCandidate(null)
      setFormData({
        desired_position: '',
        id_number: '',
        id_type: '',
        name: '',
        department: '',
        desired_salary: '',
        main_competencies: '',
        main_trainings: '',
        recommended_by: '',
        status: 'active'
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCandidate(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = sessionStorage.getItem('token')
    try {
      let response
      if (editingCandidate) {
        response = await axios.put(`${API_URL}/candidates/${editingCandidate.candidate_id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      } else {
        response = await axios.post(`${API_URL}/candidates`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      }
      if (response.data.status) {
        fetchCandidates()
        handleCloseModal()
        showAlert(response.data.message, 'success')
      } else {
        showAlert(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error submitting candidate:', error)
      showAlert(error.response?.data?.message || "No se pudo guardar el candidato. Por favor, intente nuevamente.", 'error')
    }
  }

  const handleDeleteConfirmation = (id) => {
    setCandidateToDelete(id)
    setIsDeleteAlertOpen(true)
  }

  const handleDelete = async () => {
    const token = sessionStorage.getItem('token')
    try {
      const response = await axios.delete(`${API_URL}/candidates/${candidateToDelete}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      if (response.data.status) {
        fetchCandidates()
        setIsDeleteAlertOpen(false)
        setCandidateToDelete(null)
        showAlert(response.data.message, 'success')
      } else {
        showAlert(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error deleting candidate:', error)
      showAlert("No se pudo eliminar el candidato. Por favor, intente nuevamente.", 'error')
    }
  }

  const handleSelectAsEmployee = (candidate) => {
    setSelectedCandidate(candidate)
    setIsSelectAlertOpen(true)
  }

  const confirmSelectAsEmployee = async () => {
    // Here you would typically make an API call to update the candidate's status
    // For now, we'll just update the local state
    setCandidates(candidates.map(c => 
      c.candidate_id === selectedCandidate.candidate_id ? { ...c, status: 'hired' } : c
    ))
    setIsSelectAlertOpen(false)
    setSelectedCandidate(null)
    showAlert("Candidato seleccionado como empleado exitosamente.", 'success')
  }

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.desired_position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Candidatos</CardTitle>
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
            <CirclePlus className="mr-2 h-4 w-4" /> Agregar Candidato
          </Button>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar candidatos..."
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
                <TableHead>Documento</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Posición</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.candidate_id}>
                  <TableCell>{candidate.id_number}</TableCell>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{candidate.desired_position}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => handleOpenModal(candidate)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => handleDeleteConfirmation(candidate.candidate_id)}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                    <Button 
                      className={candidate.status === 'hired' ? "bg-green-500 hover:bg-green-600 text-white" : "bg-yellow-500 hover:bg-yellow-600 text-white"}
                      size="sm" 
                      onClick={() => handleSelectAsEmployee(candidate)}
                      disabled={candidate.status === 'hired'}
                    >
                      {candidate.status === 'hired' ? (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Contratado
                        </>
                      ) : (
                        <>
                          <Award className="h-4 w-4 mr-1" /> Seleccionar
                        </>
                      )}
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
              <DialogTitle>{editingCandidate ? 'Editar' : 'Agregar'} Candidato</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="id_number">Documento Personal</Label>
                  <Input 
                    id="id_number" 
                    value={formData.id_number}
                    onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                    placeholder="Número de documento"
                  />
                </div>
                <div>
                  <Label htmlFor="id_type">Tipo de Documento</Label>
                  <Select value={formData.id_type} onValueChange={(value) => setFormData({...formData, id_type: value})}>
                    <SelectTrigger id="id_type">
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal-id">Cédula</SelectItem>
                      <SelectItem value="passport">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="desired_position">Posición Deseada</Label>
                <Select value={formData.desired_position} onValueChange={(value) => setFormData({...formData, desired_position: value})}>
                  <SelectTrigger id="desired_position">
                    <SelectValue placeholder="Seleccione la posición" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.position_id} value={pos.position_id.toString()}>{pos.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Departamento</Label>
                <Input 
                   
                  id="department" 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="Departamento"
                />
              </div>
              <div>
                <Label htmlFor="desired_salary">Salario Esperado (RD$)</Label>
                <Input 
                  id="desired_salary" 
                  type="number"
                  value={formData.desired_salary}
                  onChange={(e) => setFormData({...formData, desired_salary: e.target.value})}
                  placeholder="Salario esperado"
                />
              </div>
              <div>
                <Label htmlFor="main_competencies">Principales Competencias</Label>
                <Textarea 
                  id="main_competencies"
                  value={formData.main_competencies}
                  onChange={(e) => setFormData({...formData, main_competencies: e.target.value})}
                  placeholder="Describa las principales competencias"
                />
              </div>
              <div>
                <Label htmlFor="main_trainings">Principales Capacitaciones</Label>
                <Textarea 
                  id="main_trainings"
                  value={formData.main_trainings}
                  onChange={(e) => setFormData({...formData, main_trainings: e.target.value})}
                  placeholder="Describa las principales capacitaciones"
                />
              </div>
              <div>
                <Label htmlFor="recommended_by">Recomendado por</Label>
                <Input 
                  id="recommended_by" 
                  value={formData.recommended_by}
                  onChange={(e) => setFormData({...formData, recommended_by: e.target.value})}
                  placeholder="Nombre de quien recomienda"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#219ebc] hover:bg-[#1d8aa8]">
                  {editingCandidate ? 'Actualizar' : 'Agregar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de que desea eliminar este candidato?</AlertDialogTitle>
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

        <AlertDialog open={isSelectAlertOpen} onOpenChange={setIsSelectAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Seleccionar como Empleado</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro de que desea seleccionar a {selectedCandidate?.name} como empleado?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsSelectAlertOpen(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSelectAsEmployee} className="bg-green-600 hover:bg-green-700">
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}