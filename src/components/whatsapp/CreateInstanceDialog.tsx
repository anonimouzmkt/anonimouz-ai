import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateInstanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instanceName: string;
  onInstanceNameChange: (value: string) => void;
  onSubmit: () => void;
  isCreating: boolean;
}

export const CreateInstanceDialog = ({
  open,
  onOpenChange,
  instanceName,
  onInstanceNameChange,
  onSubmit,
  isCreating,
}: CreateInstanceDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Nova Instância do WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Instância</Label>
            <Input
              id="name"
              placeholder="Digite o nome da instância"
              value={instanceName}
              onChange={(e) => onInstanceNameChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onInstanceNameChange("");
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isCreating}
            className="bg-primary hover:bg-primary/90"
          >
            {isCreating ? "Criando..." : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};