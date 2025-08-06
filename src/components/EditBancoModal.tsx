'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Banco, UpdateBancoRequest } from '@/types/banco';

interface EditBancoModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateBancoRequest) => void;
  banco: Banco | null;
}

export default function EditBancoModal({ open, onClose, onSubmit, banco }: EditBancoModalProps) {
  const [formData, setFormData] = useState<UpdateBancoRequest>({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo: ''
  });
  const [loading, setLoading] = useState(false);

  // Cargar datos del banco cuando se abre el modal
  useEffect(() => {
    if (banco) {
      setFormData({
        codigo: banco.codigo || '',
        nombre: banco.nombre || '',
        descripcion: banco.descripcion || '',
        tipo: banco.tipo || ''
      });
    }
  }, [banco]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre?.trim()) {
      alert('El nombre del banco es requerido');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error al actualizar banco:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: ''
    });
    setLoading(false);
    onClose();
  };

  const handleChange = (field: keyof UpdateBancoRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!banco) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Banco: {banco.nombre}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                placeholder="Código del banco"
                value={formData.codigo}
                onChange={(e) => handleChange('codigo', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nacional">Nacional</SelectItem>
                  <SelectItem value="Internacional">Internacional</SelectItem>
                  <SelectItem value="Estatal">Estatal</SelectItem>
                  <SelectItem value="Privado">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Banco *</Label>
            <Input
              id="nombre"
              placeholder="Nombre del banco"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Descripción del banco"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar Banco'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 