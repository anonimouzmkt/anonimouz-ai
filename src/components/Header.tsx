import { Switch } from "@/components/ui/switch";

export function Header() {
  return (
    <div className="flex items-center justify-between bg-card rounded-lg p-4">
      <div>
        <h1 className="text-2xl font-bold text-card-foreground">Disparador A.I</h1>
        <p className="text-muted-foreground">
          Dispare mensagens com I.A{" "}
          <span className="text-primary">Imobiliária Gabriel</span>
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[#22c55e]">Ligado</span>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );
}