"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const changelog = [
    {
        version: "v0.7",
        date: "2024-07-28",
        title: "Lógica de Competición y Estabilidad",
        description: "Se refina la lógica del torneo para que coincida exactamente con las reglas y se solucionan errores persistentes para una mayor robustez.",
        changes: [
            "Ajustada la lógica para que el orden de salida en Octavos sea aleatorio y en las demás rondas por puntuación.",
            "Mejorada la interfaz para mostrar claramente las puntuaciones acumuladas en las fases eliminatorias.",
            "Solucionado error de 'claves duplicadas' en el historial para una renderización estable.",
            "Corregido un error de hidratación de Next.js para mejorar la carga inicial."
        ]
    },
     {
        version: "v0.6",
        date: "2024-07-27",
        title: "Navegación y Revisión de Rondas",
        description: "Se introduce la capacidad de revisar los resultados de las rondas anteriores de un torneo en curso, mejorando la usabilidad y la capacidad de auditoría.",
        changes: [
            "Añadidos botones de navegación para moverse entre los resultados de rondas pasadas.",
            "Implementado un estado de 'fase visualizada' para diferenciar la ronda activa de la consultada.",
        ]
    },
    {
        version: "v0.5",
        date: "2024-07-26",
        title: "Historial y Persistencia",
        description: "Se añade la capacidad de guardar torneos finalizados y consultarlos en un historial. La aplicación ahora recuerda los torneos en curso entre sesiones gracias a la persistencia en el navegador (localStorage).",
        changes: [
            "Implementado el guardado automático de torneos finalizados.",
            "Añadido un visor de historial de torneos.",
            "El estado del torneo actual persiste al cerrar y abrir el navegador."
        ]
    },
    {
        version: "v0.4",
        date: "2024-07-25",
        title: "Exportación y Documentación",
        description: "Se introduce la funcionalidad de exportar el código fuente completo como un archivo ZIP. Se mejora la documentación interna y se integra el README en la interfaz de usuario.",
        changes: [
            "Creada la función para empaquetar el proyecto en un ZIP descargable.",
            "Refactorizado el README para ser más descriptivo y añadir fragmentos de código.",
            "Integrado el contenido del README en el diálogo 'Acerca de'."
        ]
    },
    {
        version: "v0.3",
        date: "2024-07-24",
        title: "Mejoras de Interfaz y Lógica de Torneo",
        description: "Se refina la lógica para el avance entre rondas acumulando puntuaciones. Se mejora la presentación de resultados y se añaden logs de auditoría para mayor transparencia.",
        changes: [
            "Ajustada la lógica de puntuación para rondas eliminatorias.",
            "Mejorado el diseño visual de la pantalla de resultados de ronda.",
            "Añadido un log de auditoría para revisar las puntuaciones de rondas anteriores."
        ]
    },
    {
        version: "v0.2",
        date: "2024-07-23",
        title: "Componentes Visuales y 3D",
        description: "Se enriquece la experiencia visual con una escena 3D de fondo usando Three.js y se refina la interfaz de usuario con componentes de ShadCN UI y animaciones de Framer Motion.",
        changes: [
            "Integrada escena 3D con shaders personalizados.",
            "Implementadas animaciones fluidas en las transiciones de pantalla y elementos de la UI.",
            "Mejorado el diseño general de la aplicación para una apariencia más profesional."
        ]
    },
    {
        version: "v0.1",
        date: "2024-07-22",
        title: "Creación Inicial y Funcionalidad Básica",
        description: "Establecimiento de la estructura del proyecto y la lógica fundamental del torneo. Se sientan las bases de la aplicación.",
        changes: [
            "Configuración inicial del proyecto con Next.js, React, TypeScript y Tailwind CSS.",
            "Implementada la lógica para añadir/eliminar participantes.",
            "Creadas las pantallas de configuración, competición y ganador.",
            "Desarrollado el sistema de registro de puntuaciones por ronda."
        ]
    }
];


export function ChangelogDialogContent() {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl">Registro de Versiones del Proyecto</DialogTitle>
        <DialogDescription>
          Un resumen de la evolución de la aplicación a través de nuestra colaboración.
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[70vh] pr-4">
        <div className="space-y-8">
          {changelog.map((entry) => (
            <div key={entry.version}>
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold text-foreground">{entry.title}</h3>
                <Badge variant="secondary">{entry.version}</Badge>
                <span className="text-sm text-muted-foreground">{entry.date}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{entry.description}</p>
              <ul className="mt-3 list-disc list-inside space-y-1 text-sm">
                {entry.changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
       <DialogFooter>
        <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
