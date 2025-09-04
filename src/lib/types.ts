import { z } from 'zod';

export interface Participant {
  id: number;
  name: string;
}

export type TournamentPhase =
  | "setup"
  | "qualification"
  | "octavos"
  | "cuartos"
  | "semifinal"
  | "final"
  | "finished";

export interface ScoreRecord {
  participantId: number;
  scores: number[];
  total: number;
}

export interface KnockoutScoreRecord extends ScoreRecord {
  previousRoundTotal: number;
  accumulatedTotal: number;
}

export type AnyScoreRecord = ScoreRecord | KnockoutScoreRecord;

export interface TournamentState {
  phase: TournamentPhase;
  viewedPhase: TournamentPhase;
  participants: Participant[];
  originalParticipants: Participant[];
  config: {
    startPhase: TournamentPhase;
    playersPerRound: { [key in TournamentPhase]?: number };
  };
  rounds: {
    qualification: ScoreRecord[];
    octavos: ScoreRecord[];
    cuartos: KnockoutScoreRecord[];
    semifinal: KnockoutScoreRecord[];
    final: KnockoutScoreRecord[];
  };
  currentPlayerId: number | null;
  winner: Participant | null;
  finishedAt?: string;
  history: TournamentHistoryItem[];
}

export interface TournamentHistoryItem {
  id: string;
  state: TournamentState;
}


export const ExportProjectOutputSchema = z.object({
  zip: z.instanceof(Blob).describe('The blob of the zip file of the project.'),
});

export type ExportProjectOutput = z.infer<typeof ExportProjectOutputSchema>;
