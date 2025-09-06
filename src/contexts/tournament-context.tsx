"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, useMemo, useEffect } from "react";
import type {
  TournamentState,
  Participant,
  TournamentPhase,
  ScoreRecord,
  KnockoutScoreRecord,
  TournamentHistoryItem,
  AnyScoreRecord,
} from "@/lib/types";

// --- ACTIONS ---
type Action =
  | { type: "ADD_PARTICIPANT"; payload: { name: string } }
  | { type: "BULK_ADD_PARTICIPANTS"; payload: { names: string[] } }
  | { type: "REMOVE_PARTICIPANT"; payload: { id: number } }
  | { type: "UPDATE_PARTICIPANT"; payload: { id: number; name: string } }
  | { type: "SET_START_PHASE"; payload: TournamentPhase }
  | { type: "START_TOURNAMENT" }
  | { type: "SET_CURRENT_PLAYER"; payload: { id: number | null } }
  | { type: "SUBMIT_SCORE"; payload: { participantId: number; scores: number[] } }
  | { type: "ADVANCE_TO_NEXT_PHASE" }
  | { type: "RESET_TOURNAMENT" }
  | { type: "LOAD_FROM_HISTORY"; payload: { state: TournamentState } }
  | { type: "LOAD_STATE"; payload: { state: TournamentState } }
  | { type: "VIEW_PREVIOUS_ROUND" }
  | { type: "VIEW_NEXT_ROUND" }
  | { type: "LOAD_HISTORY"; payload: { history: TournamentHistoryItem[] } }
  | { type: "CLEAR_HISTORY" };


// --- REDUCER ---
const initialState: TournamentState = {
  phase: "setup",
  participants: [],
  originalParticipants: [],
  config: {
    startPhase: "qualification",
    playersPerRound: {
      qualification: 0,
      octavos: 16,
      cuartos: 8,
      semifinal: 4,
      final: 2,
      finished: 0,
    },
  },
  rounds: {
    qualification: [],
    octavos: [],
    cuartos: [],
    semifinal: [],
    final: [],
  },
  currentPlayerId: null,
  winner: null,
  viewedPhase: "setup",
  history: [],
};

const phaseOrder: TournamentPhase[] = ["qualification", "octavos", "cuartos", "semifinal", "final", "finished"];

function tournamentReducer(state: TournamentState, action: Action): TournamentState {
  switch (action.type) {
    case "LOAD_STATE":
      return { ...action.payload.state };
    
    case "LOAD_HISTORY":
      return { ...state, history: action.payload.history };

    case "ADD_PARTICIPANT": {
      const newParticipant: Participant = {
        id: Date.now(),
        name: action.payload.name,
      };
      return { ...state, participants: [...state.participants, newParticipant] };
    }
    case "BULK_ADD_PARTICIPANTS": {
      const newParticipants: Participant[] = action.payload.names.map((name, index) => ({
        id: Date.now() + index,
        name,
      }));
      const existingIds = new Set(state.participants.map(p => p.name));
      const uniqueNewParticipants = newParticipants.filter(p => !existingIds.has(p.name));
      return { ...state, participants: [...state.participants, ...uniqueNewParticipants] };
    }
    case "REMOVE_PARTICIPANT":
      return {
        ...state,
        participants: state.participants.filter((p) => p.id !== action.payload.id),
      };
    case "UPDATE_PARTICIPANT":
      return {
        ...state,
        participants: state.participants.map((p) =>
          p.id === action.payload.id ? { ...p, name: action.payload.name } : p
        ),
      };
    case "SET_START_PHASE":
      return { ...state, config: { ...state.config, startPhase: action.payload } };

    case "START_TOURNAMENT": {
      const { startPhase } = state.config;
      const originalParticipants = [...state.participants];
      let playersForFirstRound: Participant[] = [...state.participants];
      
      if (startPhase !== 'qualification' && startPhase !== 'setup' && startPhase !== 'finished') {
        const numPlayers = state.config.playersPerRound[startPhase] || state.participants.length;
        playersForFirstRound = playersForFirstRound.slice(0, numPlayers);
      }
      
      const shuffledPlayers = [...playersForFirstRound].sort(() => Math.random() - 0.5);

      return {
        ...state,
        phase: startPhase,
        viewedPhase: startPhase,
        participants: shuffledPlayers, 
        originalParticipants: originalParticipants,
        currentPlayerId: shuffledPlayers[0]?.id || null,
      };
    }
    
    case "SET_CURRENT_PLAYER":
      return { ...state, currentPlayerId: action.payload.id };

    case "SUBMIT_SCORE": {
      const { participantId, scores } = action.payload;
      const total = scores.reduce((a, b) => a + b, 0);
      const currentPhase = state.phase;

      // Ensure we don't duplicate scores
      const existingScoreIndex = state.rounds[currentPhase as keyof typeof state.rounds].findIndex(
        (s) => s.participantId === participantId
      );
      if (existingScoreIndex !== -1) {
        return state; // Player already has a score for this round
      }

      if (currentPhase === 'qualification' || currentPhase === 'octavos') {
        const newRecord: ScoreRecord = { participantId, scores, total };
        const updatedRound = [...(state.rounds[currentPhase] as ScoreRecord[]), newRecord];
        return {
          ...state,
          rounds: { ...state.rounds, [currentPhase]: updatedRound },
        };
      }
      
      if (currentPhase === 'cuartos' || currentPhase === 'semifinal' || currentPhase === 'final') {
        const prevRoundName = phaseOrder[phaseOrder.indexOf(currentPhase) - 1] as 'octavos' | 'cuartos' | 'semifinal';

        const previousRoundScores = state.rounds[prevRoundName] as AnyScoreRecord[];
        const prevScoreRecord = previousRoundScores.find(s => s.participantId === participantId);
        
        const previousRoundTotal = prevScoreRecord 
          ? 'accumulatedTotal' in prevScoreRecord ? prevScoreRecord.accumulatedTotal : prevScoreRecord.total
          : 0;
        
        const newRecord: KnockoutScoreRecord = {
          participantId,
          scores,
          total,
          previousRoundTotal: previousRoundTotal,
          accumulatedTotal: previousRoundTotal + total,
        };
        const updatedRound = [...(state.rounds[currentPhase] as KnockoutScoreRecord[]), newRecord];
        return {
          ...state,
          rounds: { ...state.rounds, [currentPhase]: updatedRound },
        };
      }
      return state;
    }

    case "ADVANCE_TO_NEXT_PHASE": {
      const { phase, rounds, config, originalParticipants, history } = state;
      const currentPhaseIndex = phaseOrder.indexOf(phase);
      
      if (phase === 'final') {
        const finalScores = rounds.final;
        const winnerScore = [...finalScores].sort((a,b) => b.accumulatedTotal - a.accumulatedTotal)[0];
        const winner = originalParticipants.find(p => p.id === winnerScore.participantId);
    
    // 1. Creamos el estado final completo, tal como queremos que se guarde.
        const finishedState = { ...state, phase: "finished" as const, winner: winner || null, finishedAt: new Date().toISOString() };
    
      if (typeof window !== 'undefined') {
        const newHistoryItemId = `${new Date().getTime()}-${originalParticipants[0]?.id || 0}`;
        
    // 2. Prevenimos duplicados en el historial, una capa extra de seguridad.
      if (!history.some(item => item.id === newHistoryItemId)) {
        const newHistoryItem: TournamentHistoryItem = {id: newHistoryItemId, state: finishedState};
        const newHistory = [newHistoryItem, ...history];
            
    // 3. Guardamos el historial actualizado.
        localStorage.setItem('pasaboloTournamentHistory', JSON.stringify(newHistory.slice(0, 20)));
      }

    // 4. (LA CLAVE) Eliminamos el torneo en curso. ¡Adiós al bucle!
        localStorage.removeItem('pasaboloTournamentState');
      }
    
    // 5. Devolvemos el estado de "ganador" para que la interfaz muestre la pantalla correcta.
    //    Además, mantenemos el historial que acabamos de actualizar.
      return { ...initialState, phase: "finished", winner: winner || null, history: state.history };
      }
      
      if (currentPhaseIndex === -1 || currentPhaseIndex >= phaseOrder.length - 2) {
        return state;
      }

      const nextPhase = phaseOrder[currentPhaseIndex + 1];
      const currentRoundScores = rounds[phase as keyof typeof rounds];
      const numToAdvance = config.playersPerRound[nextPhase as keyof typeof config.playersPerRound]!;

      const sortedForAdvancement = [...currentRoundScores].sort((a, b) => {
          const totalA = 'accumulatedTotal' in a ? a.accumulatedTotal : a.total;
          const totalB = 'accumulatedTotal' in b ? b.accumulatedTotal : b.total;
          return totalB - totalA;
      });
      
      const advancingScores = sortedForAdvancement.slice(0, numToAdvance);
      const participantMap = new Map(originalParticipants.map(p => [p.id, p]));
      let nextPlayers: Participant[] = [];

      if (phase === 'qualification') {
        nextPlayers = [...originalParticipants].filter(p => advancingScores.some(s => s.participantId === p.id)).sort(() => Math.random() - 0.5);
      } else {
        const sortedForNextRound = [...advancingScores].sort((a, b) => {
          const totalA = 'accumulatedTotal' in a ? a.accumulatedTotal : a.total;
          const totalB = 'accumulatedTotal' in b ? b.accumulatedTotal : b.total;
          return totalA - totalB;
        });
        nextPlayers = sortedForNextRound.map(score => participantMap.get(score.participantId)).filter(Boolean) as Participant[];
      }
      
      return {
          ...state,
          phase: nextPhase,
          viewedPhase: nextPhase,
          participants: nextPlayers,
          currentPlayerId: nextPlayers[0]?.id || null,
      };
    }
    
    case "LOAD_FROM_HISTORY": {
      const historicState = action.payload.state;
      const finalPhase = historicState.phase === 'finished' ? 'final' : historicState.phase;

      return {
        ...historicState,
        phase: finalPhase, 
        viewedPhase: finalPhase,
        history: state.history, // Preserve the current full history
      };
    }

    
    case "RESET_TOURNAMENT":
        if (typeof window !== 'undefined') {
            localStorage.removeItem('pasaboloTournamentState');
        }
      return {...initialState, history: state.history};
    
    case "CLEAR_HISTORY":
        if (typeof window !== 'undefined') {
            localStorage.removeItem('pasaboloTournamentHistory');
        }
        return {...state, history: []};

    case "VIEW_PREVIOUS_ROUND": {
        const currentViewIndex = phaseOrder.indexOf(state.viewedPhase);
        if (currentViewIndex > 0) {
            const prevPhase = phaseOrder[currentViewIndex - 1];
            if (state.rounds[prevPhase as keyof typeof state.rounds].length > 0) {
              return { ...state, viewedPhase: prevPhase };
            }
        }
        return state;
    }

    case "VIEW_NEXT_ROUND": {
        const currentViewIndex = phaseOrder.indexOf(state.viewedPhase);
        if (currentViewIndex < phaseOrder.indexOf(state.phase)) {
            const nextPhase = phaseOrder[currentViewIndex + 1];
            return { ...state, viewedPhase: nextPhase };
        }
        return state;
    }

    default:
      return state;
  }
}

// --- CONTEXT & PROVIDER ---
interface TournamentContextValue {
  state: TournamentState;
  dispatch: React.Dispatch<Action>;
}

const TournamentContext = createContext<TournamentContextValue | undefined>(undefined);

export const TournamentProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(tournamentReducer, initialState);
  
  useEffect(() => {
    try {
      const storedState = localStorage.getItem('pasaboloTournamentState');
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        if (parsedState.phase !== 'finished') {
          dispatch({ type: 'LOAD_STATE', payload: { state: {...parsedState, viewedPhase: parsedState.phase} }});
        }
      }
      
      const storedHistory = localStorage.getItem('pasaboloTournamentHistory');
      if(storedHistory){
        const parsedHistory = JSON.parse(storedHistory);
        // Ensure no duplicates on load
        const uniqueHistory = parsedHistory.filter((item: TournamentHistoryItem, index: number, self: TournamentHistoryItem[]) =>
            index === self.findIndex((t) => t.id === item.id)
        );
        dispatch({type: 'LOAD_HISTORY', payload: {history: uniqueHistory}})
      }

    } catch (error) {
      console.error("Error reading state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (state.phase !== 'setup' && state.phase !== 'finished' && typeof window !== 'undefined') {
      try {
        localStorage.setItem('pasaboloTournamentState', JSON.stringify(state));
      } catch (error) {
          console.error("Error writing to localStorage", error);
      }
    }
  }, [state]);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <TournamentContext.Provider value={contextValue}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error("useTournament must be used within a TournamentProvider");
  }
  return context;
};
