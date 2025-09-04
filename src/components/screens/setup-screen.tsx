"use client";

import { useState } from "react";
import { useTournament } from "@/contexts/tournament-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, UserPlus, Play, Upload, InfoIcon, History, BookText } from "lucide-react";
import { PasaboloIcon } from "@/components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TournamentPhase } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AboutDialogContent } from "@/components/about-dialog";
import { HistoryDialogContent } from "@/components/history-dialog";
import { ChangelogDialogContent } from "@/components/changelog-dialog";


export default function SetupScreen() {
  const { state, dispatch } = useTournament();
  const [newName, setNewName] = useState("");
  const [bulkNames, setBulkNames] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleAddParticipant = () => {
    if (newName.trim()) {
      dispatch({ type: "ADD_PARTICIPANT", payload: { name: newName.trim() } });
      setNewName("");
    }
  };

  const handleBulkAdd = () => {
    const names = bulkNames.split('\n').map(name => name.trim()).filter(name => name);
    if (names.length > 0) {
      dispatch({ type: "BULK_ADD_PARTICIPANTS", payload: { names } });
      setBulkNames("");
    }
  };
  
  const canStart = state.participants.length > 1;

  const handleStartTournament = () => {
    dispatch({ type: "START_TOURNAMENT" });
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 5000); // Ocultar después de 5 segundos
  };

  return (
    <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
            <PasaboloIcon className="w-12 h-12 text-primary"/>
            <CardTitle className="text-4xl font-extrabold tracking-tight">PASABOLO TABLÓN</CardTitle>
        </div>
        <CardDescription>Configura tu torneo de Pasabolo Tablón.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {showConfirmation && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>¡Torneo Iniciado!</AlertTitle>
              <AlertDescription>
                La lista de participantes ha sido ordenada aleatoriamente para la clasificación.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Participantes ({state.participants.length})</h3>
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ingresar nombre del participante"
              onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
            />
            <Button onClick={handleAddParticipant} aria-label="Agregar participante">
              <UserPlus className="mr-2 h-4 w-4" /> Agregar
            </Button>
          </div>
           <div className="space-y-2">
            <Label htmlFor="bulk-import">Importar Participantes</Label>
            <Textarea
              id="bulk-import"
              value={bulkNames}
              onChange={(e) => setBulkNames(e.target.value)}
              placeholder="Pega una lista de nombres, uno por línea."
              rows={5}
            />
            <Button onClick={handleBulkAdd} variant="secondary" className="w-full">
              <Upload className="mr-2 h-4 w-4" /> Importar Nombres
            </Button>
          </div>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
            <AnimatePresence>
            {state.participants.map((p) => (
              <motion.div 
                key={p.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                className="flex items-center justify-between bg-background p-2 rounded-md shadow-sm"
              >
                <span>{p.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch({ type: "REMOVE_PARTICIPANT", payload: { id: p.id } })}
                  aria-label={`Eliminar ${p.name}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start-phase">Comenzar desde</Label>
          <Select
            value={state.config.startPhase}
            onValueChange={(value) => dispatch({ type: "SET_START_PHASE", payload: value as TournamentPhase })}
          >
            <SelectTrigger id="start-phase">
              <SelectValue placeholder="Seleccionar fase inicial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qualification">Clasificación</SelectItem>
              <SelectItem value="octavos">Octavos de Final</SelectItem>
              <SelectItem value="cuartos">Cuartos de Final</SelectItem>
              <SelectItem value="semifinal">Semifinales</SelectItem>
              <SelectItem value="final">Final</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          size="lg"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg"
          onClick={handleStartTournament}
          disabled={!canStart}
        >
          <Play className="mr-2 h-5 w-5" /> Iniciar Torneo
        </Button>
         {!canStart && <p className="text-center text-sm text-muted-foreground">Agrega al menos 2 participantes para comenzar.</p>}
      </CardContent>
       <CardFooter className="flex justify-center items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link" className="text-muted-foreground">
              <InfoIcon className="mr-2 h-4 w-4" />
              Acerca de esta App
            </Button>
          </DialogTrigger>
          <AboutDialogContent />
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link" className="text-muted-foreground">
              <History className="mr-2 h-4 w-4" />
              Ver Historial
            </Button>
          </DialogTrigger>
          <HistoryDialogContent />
        </Dialog>
         <Dialog>
          <DialogTrigger asChild>
            <Button variant="link" className="text-muted-foreground">
              <BookText className="mr-2 h-4 w-4" />
              Registro de Versiones
            </Button>
          </DialogTrigger>
          <ChangelogDialogContent />
        </Dialog>
      </CardFooter>
    </Card>
  );
}
