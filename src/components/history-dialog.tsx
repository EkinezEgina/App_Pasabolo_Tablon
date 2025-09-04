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
import { Separator } from "@/components/ui/separator";
import { Eye, Trash2 } from "lucide-react";
import type { TournamentHistoryItem } from "@/lib/types";
import { useTournament } from "@/contexts/tournament-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export function HistoryDialogContent() {
  const { state, dispatch } = useTournament();
  const { history } = state;
  
  const handleView = (item: TournamentHistoryItem) => {
    dispatch({type: "LOAD_FROM_HISTORY", payload: { state: item.state }});
  }
  
  const clearHistory = () => {
    dispatch({ type: "CLEAR_HISTORY" });
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl">Historial de Torneos</DialogTitle>
        <DialogDescription>
          Aquí puedes ver los torneos que ya han finalizado.
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[70vh] pr-4">
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="font-semibold">
                    Ganador: {item.state.winner?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Finalizado el: {new Date(item.state.finishedAt!).toLocaleString('es-ES')}
                  </p>
                </div>
                <DialogClose asChild>
                  <Button variant="outline" size="sm" onClick={() => handleView(item)}>
                    <Eye className="mr-2 h-4 w-4" /> Ver Resumen
                  </Button>
                </DialogClose>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No hay torneos en el historial.</p>
        )}
      </ScrollArea>
      <Separator />
      <DialogFooter className="sm:justify-between">
         <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={history.length === 0}>
                    <Trash2 className="mr-2 h-4 w-4"/> Limpiar Historial
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se borrará permanentemente todo el historial de torneos.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory}>Continuar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
