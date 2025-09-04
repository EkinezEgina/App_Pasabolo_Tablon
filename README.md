# PASABOLO TABLÓN - Gestor de Torneos con IA

Esta aplicación es un gestor de torneos para el deporte tradicional de Pasabolo Tablón, desarrollada como una demostración de las capacidades de un entorno de desarrollo asistido por IA.

El proyecto está diseñado para ser completamente funcional, autocontenido y servir como un ejemplo práctico y educativo. No requiere de APIs externas y se puede exportar el código fuente completo directamente desde la aplicación.

![Captura de pantalla de la configuración del torneo](https://storage.googleapis.com/project-hosting-images/pasabolo-setup.png)

## Tecnologías Utilizadas

A continuación se detallan las principales tecnologías utilizadas, junto con fragmentos de código "picantes" que ilustran su implementación.

### Next.js & React
Para construir una interfaz de usuario moderna y reactiva utilizando el App Router para la orquestación de las diferentes pantallas de la aplicación.

*src/app/page.tsx*
```tsx
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
```

### TypeScript
Para un código más robusto y mantenible gracias al tipado estático, definiendo estructuras de datos claras para todo el torneo.

*src/lib/types.ts*
```ts
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
```

### Tailwind CSS & ShadCN UI
Para un diseño estético, consistente y personalizable, acelerando el desarrollo con componentes pre-construidos y un sistema de utilidades CSS.

*src/components/screens/setup-screen.tsx*
```tsx
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
```

### Three.js & react-three-fiber
Para la escena 3D interactiva del fondo, creando un ambiente dinámico y visualmente atractivo con shaders personalizados.

*src/components/three-scene.tsx*
```tsx
const fragmentShader = `
  uniform float u_time;
  uniform vec3 u_color_primary;
  uniform vec3 u_color_accent;
  varying vec2 vUv;

  void main() {
    float ripple = sin((vUv.x - 0.5) * 10.0 + u_time * 2.0) * 0.5 + 0.5;
    vec3 color = mix(u_color_primary, u_color_accent, ripple);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const ThreeScene: React.FC = () => {
  // ... configuración de la escena, cámara y renderer
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: { /* ... */ },
    vertexShader,
    fragmentShader,
  });
  // ...
};
```

### JSZip
Para la generación de archivos ZIP autocontenidos directamente en el navegador, permitiendo a los usuarios descargar el código fuente completo del proyecto.

*src/ai/flows/export-project-flow.ts*
```ts
import JSZip from "jszip";
import { listProjectFiles } from "@/ai/tools/list-project-files";
import { readFile } from "@/ai/tools/read-file";

export async function exportProjectFlow(): Promise<ExportProjectOutput> {
  const files = await listProjectFiles({});
  const zip = new JSZip();
  for (const file of files) {
    const content = await readFile({ path: file });
    zip.file(file, content);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  // ...
}
```

### Zod & React Hook Form
Para la validación de esquemas y la gestión de formularios complejos de manera eficiente, como en la entrada de puntuaciones.

*src/components/score-input-dialog.tsx*
```tsx
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
```

### Framer Motion
Para animaciones fluidas y atractivas que mejoran la experiencia de usuario, especialmente en transiciones y elementos destacados.

*src/components/screens/winner-screen.tsx*
```tsx
import { motion } from "framer-motion";
import { Crown, PartyPopper } from "lucide-react";

// ...
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
>
  <Crown className="w-24 h-24 mx-auto text-amber-400" />
  {[...Array(5)].map((_, i) => (
      <motion.div
          key={i}
          animate={{ y: -20, opacity: [0, 1, 0] }}
          transition={{ delay: 0.5 + i * 0.1, repeat: Infinity }}
      >
          <PartyPopper />
      </motion.div>
  ))}
</motion.div>
```

## Filosofía de Desarrollo
El proyecto se ha construido siguiendo un enfoque de "desarrollo conversacional". Cada funcionalidad ha sido implementada a través de un diálogo con un asistente de IA, demostrando cómo la colaboración humano-IA puede acelerar y enriquecer el proceso de creación de software.

## Para Empezar

1.  **Exporta el código:** Utiliza el botón "Exportar a Zip" en el diálogo "Acerca de".
2.  **Descomprime y navega:** `unzip pasabolo-tablon-project.zip && cd pasabolo-tablon-project`
3.  **Instala las dependencias:** `npm install`
4.  **Ejecuta el servidor de desarrollo:** `npm run dev`
5.  **Abre tu navegador:** Visita `http://localhost:9002`.

¡Explora el código, experimenta y diviértete!