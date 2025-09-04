"use client";

import { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Download, Loader2 } from "lucide-react";
import { exportProjectFlow } from "@/ai/flows/export-project-flow";

function ExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const { zip } = await exportProjectFlow();
      const blob = new Blob([zip], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pasabolo-tablon-project.zip";
      document.body.appendChild(a);
a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Error exporting project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Exportar a Zip
        </>
      )}
    </Button>
  );
}

const CodeBlock: React.FC<{ code: string; lang: string }> = ({ code, lang }) => (
  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
    <code className={`language-${lang}`}>{code.trim()}</code>
  </pre>
);

export function AboutDialogContent() {
  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle className="text-2xl">Acerca de la APP Pasabolo Tablón</DialogTitle>
        <DialogDescription>
          Es una App para gestionar torneos para el deporte tradicional de Pasabolo Tablón, desarrollada como una demostración de las capacidades de un entorno de desarrollo asistido por IA.
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[70vh] pr-4">
        <div className="space-y-6 text-sm text-muted-foreground prose-sm prose-invert">
            <p>
                El proyecto está diseñado para ser completamente funcional, autocontenido y servir como un ejemplo práctico y educativo. No requiere de APIs externas y se puede exportar el código fuente completo directamente desde la aplicación.
            </p>

            <h3 className="font-semibold text-foreground text-lg">Tecnologías Utilizadas</h3>
            <p>A continuación se detallan las principales tecnologías utilizadas, junto con fragmentos de código "picantes" que ilustran su implementación.</p>

            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground">Next.js & React</h4>
                    <p>Para construir una interfaz de usuario moderna y reactiva utilizando el App Router para la orquestación de las diferentes pantallas de la aplicación.</p>
                    <CodeBlock lang="tsx" code={`
function TournamentOrchestrator() {
  const { state } = useTournament();

  const renderScreen = () => {
    switch (state.phase) {
      case "setup":
        return <SetupScreen />;
      case "finished":
        return <WinnerScreen />;
      case "qualification":
      // ... y otras fases
        return <CompetitionScreen />;
      default:
        return <SetupScreen />;
    }
  };

  return (
    // ... JSX que renderiza la pantalla correcta
  );
}
                    `} />
                </div>

                <div>
                    <h4 className="font-semibold text-foreground">TypeScript</h4>
                    <p>Para un código más robusto y mantenible gracias al tipado estático, definiendo estructuras de datos claras para todo el torneo.</p>
                    <CodeBlock lang="ts" code={`
export type TournamentPhase =
  | "setup"
  | "qualification"
  | "octavos"
  | "cuartos"
  | "semifinal"
  | "final"
  | "finished";

export interface KnockoutScoreRecord extends ScoreRecord {
  previousRoundTotal: number;
  accumulatedTotal: number;
}

export interface TournamentState {
  phase: TournamentPhase;
  participants: Participant[];
  // ... más estado
}
                    `} />
                </div>
                
                 <div>
                    <h4 className="font-semibold text-foreground">Tailwind CSS & ShadCN UI</h4>
                    <p>Para un diseño estético, consistente y personalizable, acelerando el desarrollo con componentes pre-construidos y un sistema de utilidades CSS.</p>
                    <CodeBlock lang="tsx" code={`
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";

// ...

<Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm">
  <CardHeader>
    <CardTitle>PASABOLO TABLON</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex gap-2">
      <Input placeholder="Ingresar nombre del participante" />
      <Button>
        <UserPlus className="mr-2 h-4 w-4" /> Agregar
      </Button>
    </div>
  </CardContent>
</Card>
                    `} />
                </div>

                <div>
                    <h4 className="font-semibold text-foreground">Zod & React Hook Form</h4>
                    <p>Para la validación de esquemas y la gestión de formularios complejos de manera eficiente, como en la entrada de puntuaciones.</p>
                    <CodeBlock lang="tsx" code={`
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const scoreSchema = z.object({
  scores: z.array(z.object({ 
    value: z.coerce.number().min(0).max(210) 
  })).length(8, "Debe tener 8 puntuaciones"),
});

export function ScoreInputDialog({ onSubmit }) {
  const form = useForm<z.infer<typeof scoreSchema>>({
    resolver: zodResolver(scoreSchema),
    defaultValues: { scores: Array(8).fill({ value: 0 }) },
  });

  // ... lógica del formulario
}
                    `} />
                </div>
            </div>

            <h3 className="font-semibold text-foreground text-lg">Filosofía de Desarrollo</h3>
            <p>
                El proyecto se ha construido siguiendo un enfoque de "desarrollo conversacional". Cada funcionalidad ha sido implementada a través de un diálogo con un asistente de IA, demostrando cómo la colaboración humano-IA puede acelerar y enriquecer el proceso de creación de software.
            </p>
        </div>
      </ScrollArea>
      <Separator />
      <DialogFooter className="sm:justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Descarga el código fuente para explorar y aprender.
        </p>
        <ExportButton />
      </DialogFooter>
    </DialogContent>
  );
}
