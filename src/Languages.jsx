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

export default function Languages() {
  const [languages, setLanguages] = useState([])
  const [filteredLanguages, setFilteredLanguages] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState(null)
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [languageToDelete, setLanguageToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'info' })

  useEffect(() => {
    fetchLanguages()
  }, [])

  useEffect(() => {
    filterLanguages()
  }, [languages, searchTerm])

  const fetchLanguages = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.get('http://127.0.0.1:8000/api/languages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      if (response.data.status === 'success') {
        setLanguages(response.data.data)
      } else {
        showAlert(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error fetching languages:', error)
      showAlert("No se pudieron cargar los idiomas. Por favor, intente nuevamente.", 'error')
    }
  }

  const filterLanguages = () => {
    const filtered = languages.filter(language =>
      language.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      language.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredLanguages(filtered)
  }

  const showAlert = (message, type = 'info') => {
    setAlertInfo({ show: true, message, type })
    setTimeout(() => setAlertInfo({ show: false, message: '', type: 'info' }), 5000)
  }

  const handleOpenModal = (language = null) => {
    if (language) {
      setEditingLanguage(language)
      setName(language.name)
      setStatus(language.status)
    } else {
      setEditingLanguage(null)
      setName('')
      setStatus('')
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLanguage(null)
    setName('')
    setStatus('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = sessionStorage.getItem('token')
    const data = { name, status }
    try {
      let response
      if (editingLanguage) {
        response = await axios.put(`http://127.0.0.1:8000/api/languages/${editingLanguage.language_id}`, data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/languages', data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      }
      if (response.data.status === 'success') {
        await fetchLanguages()
        handleCloseModal()
        showAlert(response.data.message, 'success')
      } else {
        showAlert(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error submitting language:', error)
      showAlert("No se pudo guardar el idioma. Por favor, intente nuevamente.", 'error')
    }
  }

  const handleDeleteConfirmation = (id) => {
    setLanguageToDelete(id)
    setIsDeleteAlertOpen(true)
  }

  const handleDelete = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.delete(`http://127.0.0.1:8000/api/languages/${languageToDelete}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      if (response.data.status === 'success') {
        setLanguages(prevLanguages => 
          prevLanguages.filter(lang => lang.language_id !== languageToDelete)
        )
        setIsDeleteAlertOpen(false)
        setLanguageToDelete(null)
        showAlert(response.data.message, 'success')
      } else {
        showAlert(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error deleting language:', error)
      showAlert("No se pudo eliminar el idioma. Por favor, intente nuevamente.", 'error')
    }
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      'active': 'Activo',
      'disabled': 'Deshabilitado'
    }
    return statusMap[status] || status
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Idiomas</CardTitle>
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
            <CirclePlus className="mr-2 h-4 w-4" /> Agregar Idioma
          </Button>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar idiomas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 w-full"
            />
          </div>
        </div>
        {filteredLanguages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No hay idiomas registrados.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Idioma</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLanguages.map((language) => (
                <TableRow key={language.language_id}>
                  <TableCell>{language.name}</TableCell>
                  <TableCell>{getStatusLabel(language.status)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => handleOpenModal(language)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteConfirmation(language.language_id)}
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
              <DialogTitle>{editingLanguage ? 'Editar' : 'Agregar'} Idioma</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Idioma</Label>
                <Input 
                  id="name" 
                  placeholder="Nombre del idioma" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    <SelectItem value="disabled">Deshabilitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#219ebc] hover:bg-[#1d8aa8]">
                  {editingLanguage ? 'Actualizar' : 'Agregar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de que desea eliminar este idioma?</AlertDialogTitle>
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