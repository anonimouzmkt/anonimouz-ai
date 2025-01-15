import { Textarea } from "@/components/ui/textarea";

interface AIContextInputProps {
  context: string;
  onContextChange: (context: string) => void;
}

export function AIContextInput({ context, onContextChange }: AIContextInputProps) {
  return (
    <div>
      <div>
        <h2 className="text-card-foreground mb-1">
          Descreva pro <span className="font-bold">Agent</span> qual o contexto
          do disparo
        </h2>
        <p className="text-muted-foreground">
          ou caso <span className="font-bold">esteja no prompt</span> avise
        </p>
        <p className="text-primary text-sm mt-2">
          Exemplo: Seu objetivo está dentro do seu prompt principal na área
          disparo
        </p>
      </div>
      <Textarea
        placeholder="Escreva o contexto do disparo para o seu agente"
        value={context}
        onChange={(e) => onContextChange(e.target.value)}
        className="min-h-[100px] mt-4"
      />
    </div>
  );
}