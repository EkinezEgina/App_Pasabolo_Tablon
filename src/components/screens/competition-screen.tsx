"use client";

import { useState, useMemo, useEffect } from "react";
import { useTournament } from "@/contexts/tournament-context";
import { ScoreInputDialog } from "@/components/score-input-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Participant, ScoreRecord, KnockoutScoreRecord, AnyScoreRecord, TournamentPhase } from "@/lib/types";
import { ChevronsRight, Crown, Trophy, SkipForward, FileText, Beaker, History, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const phaseTitles: { [key: string]: string } = {
  qualification: "Ronda de Clasificación",
  octavos: "Octavos de Final",
  cuartos: "Cuartos de Final",
  semifinal: "Semifinales",
  final: "La Gran Final",
};

function AuditLogDialog() {
    const { state } = useTournament();
    const { rounds, originalParticipants, phase } = state;
    const participantMap = useMemo(() => new Map(originalParticipants.map(p => [p.id, p.name])), [originalParticipants]);
    const phaseOrder: TournamentPhase[] = ["qualification", "octavos", "cuartos", "semifinal", "final"];
    const relevantPhases = phaseOrder.slice(0, phaseOrder.indexOf(phase));

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Registro de Auditoría del Torneo</DialogTitle>
                <DialogDescription>
                    Un resumen completo de todas las rondas jugadas hasta ahora.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-6">
                <div className="space-y-6">
                    {relevantPhases.map(p => {
                        const scores = rounds[p as keyof typeof rounds];
                        if (!scores || scores.length === 0) return null;

                        const sortedScores = [...scores].sort((a, b) => ('accumulatedTotal' in b ? b.accumulatedTotal : b.total) - ('accumulatedTotal' in a ? a.accumulatedTotal : a.total));
                        const isKnockout = 'accumulatedTotal' in scores[0];
                        
                        return (
                            <div key={p}>
                                <h3 className="text-xl font-semibold mb-2">{phaseTitles[p]}</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Jugador</TableHead>
                                            {isKnockout && <TableHead>Prev.</TableHead>}
                                            <TableHead>Ronda</TableHead>
                                            <TableHead>Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedScores.map((score, index) => (
                                            <TableRow key={score.participantId}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{participantMap.get(score.participantId) ?? 'N/A'}</TableCell>
                                                {isKnockout && <TableCell>{(score as KnockoutScoreRecord).previousRoundTotal}</TableCell>}
                                                <TableCell>{score.total}</TableCell>
                                                <TableCell className="font-bold text-primary">
                                                  {'accumulatedTotal' in score ? score.accumulatedTotal : score.total}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Separator className="mt-6"/>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
        </DialogContent>
    )
}

export default function CompetitionScreen() {
  const { state, dispatch } = useTournament();
  const { phase, participants, rounds, currentPlayerId, originalParticipants, viewedPhase } = state;
  const [isScoreModalOpen, setScoreModalOpen] = useState(false);
  
  const currentPhaseForDisplay = viewedPhase || phase;

  const currentScores = rounds[currentPhaseForDisplay as keyof typeof rounds] as AnyScoreRecord[];
  const activeScores = rounds[phase as keyof typeof rounds] as AnyScoreRecord[];
  
  const playersInOrder = useMemo(() => {
    const scoredPlayerIds = new Set(activeScores.map(s => s.participantId));
    return participants.filter(p => !scoredPlayerIds.has(p.id));
  }, [participants, activeScores]);


  useEffect(() => {
    if (playersInOrder.length > 0) {
      if (currentPlayerId === null || !participants.some(p => p.id === currentPlayerId)) {
        dispatch({ type: "SET_CURRENT_PLAYER", payload: { id: playersInOrder[0].id } });
      } else if (!playersInOrder.some(p => p.id === currentPlayerId)) {
        // Current player finished, move to next
         dispatch({ type: "SET_CURRENT_PLAYER", payload: { id: playersInOrder[0].id } });
      }
    } else if (activeScores.length === participants.length && participants.length > 0) {
      if (currentPlayerId !== null) {
        dispatch({ type: "SET_CURRENT_PLAYER", payload: { id: null } });
      }
    }
  }, [playersInOrder, currentPlayerId, participants, activeScores.length, dispatch]);


  const currentPlayer = useMemo(() => participants.find(p => p.id === currentPlayerId), [participants, currentPlayerId]);
  const isRoundFinished = playersInOrder.length === 0 && participants.length > 0;
  const isViewingHistory = phase !== viewedPhase;

  const handleScoreSubmit = (scores: number[]) => {
    if (!currentPlayerId) return;
    dispatch({ type: "SUBMIT_SCORE", payload: { participantId: currentPlayerId, scores } });
    setScoreModalOpen(false);

    // Set next player
    const currentIndex = participants.findIndex(p => p.id === currentPlayerId);
    const nextPlayer = participants[currentIndex + 1];
    if(nextPlayer) {
      dispatch({ type: "SET_CURRENT_PLAYER", payload: { id: nextPlayer.id } });
    } else {
      dispatch({ type: "SET_CURRENT_PLAYER", payload: { id: null } });
    }
  };

  const handleAutocompleteRound = () => {
    const playersToScore = playersInOrder; // Use a snapshot
    playersToScore.forEach((player, index) => {
      setTimeout(() => {
        const randomScores = Array(8).fill(0).map(() => Math.floor(Math.random() * (210/8))); // Lower scores for more realistic testing
        dispatch({ type: "SUBMIT_SCORE", payload: { participantId: player.id, scores: randomScores } });
        if(index === playersToScore.length - 1) {
          dispatch({ type: "SET_CURRENT_PLAYER", payload: { id: null } });
        }
      }, index * 50); // Stagger dispatches to prevent race conditions
    });
  };
  
  const getPlayerScore = (participantId: number) => currentScores.find(s => s.participantId === participantId);
  
  const phaseOrder: TournamentPhase[] = ["qualification", "octavos", "cuartos", "semifinal", "final"];
  const viewedPhaseIndex = phaseOrder.indexOf(currentPhaseForDisplay);
  const currentPhaseIndex = phaseOrder.indexOf(phase);
  
  // Determine if we can navigate
  const canViewPrevious = viewedPhaseIndex > 0 && state.rounds[phaseOrder[viewedPhaseIndex - 1] as keyof typeof state.rounds] && state.rounds[phaseOrder[viewedPhaseIndex - 1] as keyof typeof state.rounds].length > 0;
  const canViewNext = viewedPhaseIndex < currentPhaseIndex;


  const renderResults = () => {
    const sortedScores = [...currentScores].sort((a, b) => ('accumulatedTotal' in b ? b.accumulatedTotal : b.total) - ('accumulatedTotal' in a ? a.accumulatedTotal : a.total));
    const nextPhaseMap: Record<string, keyof typeof state.config.playersPerRound> = {
      qualification: 'octavos',
      octavos: 'cuartos',
      cuartos: 'semifinal',
      semifinal: 'final',
      final: 'finished'
    };
    const nextPhaseKey = nextPhaseMap[currentPhaseForDisplay];
    const advancingCount = state.config.playersPerRound[nextPhaseKey] ?? 0;
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-3xl font-bold">Resultados de la Ronda: {phaseTitles[currentPhaseForDisplay]}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => dispatch({type: 'VIEW_PREVIOUS_ROUND'})} disabled={!canViewPrevious}><ChevronLeft /></Button>
                      <Button variant="outline" size="icon" onClick={() => dispatch({type: 'VIEW_NEXT_ROUND'})} disabled={!canViewNext}><ChevronRight /></Button>
                    </div>
                </div>
                <CardDescription>
                  {isViewingHistory && <span className="text-accent font-semibold">(Viendo historial) </span>}
                  {currentPhaseForDisplay !== 'final' 
                    ? `Los ${advancingCount} mejores avanzan a la siguiente ronda.`
                    : 'El torneo ha finalizado.'
                  }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedScores.map((score, index) => {
                        const player = state.originalParticipants.find(p => p.id === score.participantId);
                        const isAdvancing = index < advancingCount;
                        return (
                            <motion.div
                                key={score.participantId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={`flex items-center p-4 ${isAdvancing && currentPhaseForDisplay !== 'final' ? 'border-accent' : ''}`}>
                                    <div className="flex-shrink-0 w-12 text-center">
                                        <span className="text-2xl font-bold">{index + 1}</span>
                                    </div>
                                    <div className="flex-grow font-semibold text-lg flex items-center">
                                      {isAdvancing && currentPhaseForDisplay !== 'final' && <Trophy className="w-5 h-5 mr-3 text-amber-400"/>}
                                      {player?.name}
                                    </div>
                                    <div className="text-right">
                                        {'accumulatedTotal' in score && (
                                            <div className="text-xs text-muted-foreground">
                                                {score.previousRoundTotal} + {score.total}
                                            </div>
                                        )}
                                        <div className="text-2xl font-bold text-primary">
                                            {'accumulatedTotal' in score ? score.accumulatedTotal : score.total}
                                        </div>
                                    </div>
                                    {isAdvancing && currentPhaseForDisplay !== 'final' && <ChevronsRight className="w-6 h-6 ml-4 text-accent"/>}
                                    {currentPhaseForDisplay === 'final' && index === 0 && <Crown className="w-8 h-8 ml-4 text-amber-400"/>}
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
                {!isViewingHistory && (
                  <Button size="lg" className="w-full mt-8" onClick={() => dispatch({ type: "ADVANCE_TO_NEXT_PHASE" })}>
                      {phase === 'final' ? 'Ver Ganador' : 'Siguiente Ronda'} <SkipForward className="ml-2"/>
                  </Button>
                )}
            </CardContent>
        </motion.div>
    );
  };

  const renderActiveRound = () => {
    const isKnockout = phase !== 'qualification' && phase !== 'octavos';
    return (
      <>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold">{phaseTitles[phase]}</CardTitle>
              <CardDescription>Jugadores en espera: {playersInOrder.length}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
            {phase === 'qualification' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline"><FileText className="mr-2"/> Ver Log</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Registro de Aleatoriedad</DialogTitle>
                    <DialogDescription>
                      Orden de los participantes antes y después de la aleatorización para la ronda de clasificación.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2 border-b pb-1">Orden Original</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        {originalParticipants.map(p => <li key={p.id}>{p.name}</li>)}
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 border-b pb-1">Orden Aleatorio</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        {participants.map(p => <li key={p.id}>{p.name}</li>)}
                      </ol>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {phase !== 'qualification' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline"><History className="mr-2"/> Ver Log</Button>
                  </DialogTrigger>
                  <AuditLogDialog/>
                </Dialog>
              )}
            <Button variant="destructive" onClick={handleAutocompleteRound} disabled={playersInOrder.length === 0}>
                <Beaker className="mr-2 h-4 w-4" /> Autocompletar (Test)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  <h3 className="font-semibold mb-2">Próximos</h3>
                  <ScrollArea className="max-h-[60vh] pr-2">
                    <AnimatePresence>
                        {participants.map((player, index) => {
                            const hasScored = activeScores.some(s => s.participantId === player.id);
                            return (
                              <motion.div layout key={player.id} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0, height: 0}}>
                                  <Card 
                                      className={`p-4 mb-2 transition-all ${player.id === currentPlayerId ? 'bg-primary/20 border-primary' : ''} ${hasScored ? 'opacity-50' : ''}`}
                                  >
                                      <div className="flex justify-between items-center">
                                          <span className="font-bold">{index + 1}. {player.name}</span>
                                          {player.id === currentPlayerId && !hasScored && (
                                              <Button onClick={() => setScoreModalOpen(true)}>Ingresar Puntuación</Button>
                                          )}
                                      </div>
                                  </Card>
                              </motion.div>
                            );
                        })}
                    </AnimatePresence>
                  </ScrollArea>
              </div>
              <div>
                  <h3 className="font-semibold mb-2">Puntuaciones</h3>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Jugador</TableHead>
                              {isKnockout && <TableHead>Previo</TableHead>}
                              <TableHead>Ronda</TableHead>
                              <TableHead>Total Acum.</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {[...activeScores]
                            .sort((a,b) => ('accumulatedTotal' in b ? b.accumulatedTotal : b.total) - ('accumulatedTotal' in a ? a.accumulatedTotal : a.total))
                            .map(scoreData => {
                              const p = state.originalParticipants.find(p => p.id === scoreData.participantId);
                              const prevTotal = 'previousRoundTotal' in scoreData ? scoreData.previousRoundTotal : null;
                              return (
                                  <TableRow key={p!.id}>
                                      <TableCell className="font-medium">{p!.name}</TableCell>
                                      {isKnockout && <TableCell>{prevTotal}</TableCell>}
                                      <TableCell>{scoreData.total}</TableCell>
                                      <TableCell className="font-bold text-primary">
                                          {'accumulatedTotal' in scoreData ? scoreData.accumulatedTotal : scoreData.total}
                                      </TableCell>
                                  </TableRow>
                              )
                          })}
                      </TableBody>
                  </Table>
              </div>
          </div>
        </CardContent>
        <ScoreInputDialog
          isOpen={isScoreModalOpen}
          onClose={() => setScoreModalOpen(false)}
          onSubmit={handleScoreSubmit}
          player={currentPlayer || null}
        />
      </>
    );
  }

  return (
    <Card className="w-full max-w-5xl bg-card/80 backdrop-blur-sm shadow-2xl">
      {isRoundFinished ? renderResults() : renderActiveRound()}
    </Card>
  );
}
