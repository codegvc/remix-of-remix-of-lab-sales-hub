import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PaymentInfo, PaymentType, PaymentMethod } from '@/types';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payment: PaymentInfo) => void;
  total: number;
}

export function PaymentModal({ open, onClose, onConfirm, total }: PaymentModalProps) {
  const [amountPaid, setAmountPaid] = useState(String(total));
  const [paymentType, setPaymentType] = useState<PaymentType>('completo');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [observation, setObservation] = useState('');

  useEffect(() => {
    if (open) {
      setAmountPaid(String(total));
      setPaymentType('completo');
      setPaymentMethod('efectivo');
      setObservation('');
    }
  }, [open, total]);

  const change = Math.max(0, Number(amountPaid) - total);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      amountPaid: Number(amountPaid),
      change,
      paymentType,
      paymentMethod,
      observation: observation || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Información de Pago</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Total a pagar</p>
            <p className="text-2xl font-bold text-primary">Bs {total}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountPaid">Monto recibido (Bs)</Label>
            <Input
              id="amountPaid"
              type="number"
              min="0"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
          </div>

          {change > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Cambio a devolver</p>
              <p className="text-lg font-semibold text-foreground">Bs {change.toFixed(2)}</p>
            </div>
          )}

          <div className="space-y-3">
            <Label>Tipo de pago</Label>
            <RadioGroup
              value={paymentType}
              onValueChange={(v) => setPaymentType(v as PaymentType)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completo" id="completo" />
                <Label htmlFor="completo" className="font-normal cursor-pointer">Completo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credito" id="credito" />
                <Label htmlFor="credito" className="font-normal cursor-pointer">Crédito</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Método de pago</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="efectivo" id="efectivo" />
                <Label htmlFor="efectivo" className="font-normal cursor-pointer">Efectivo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="banco" id="banco" />
                <Label htmlFor="banco" className="font-normal cursor-pointer">Banco</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observación (opcional)</Label>
            <Textarea
              id="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Alguna nota adicional..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Confirmar Pago
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
