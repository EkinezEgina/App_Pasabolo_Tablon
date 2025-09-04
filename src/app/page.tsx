"use client";

import { TournamentProvider, useTournament } from "@/contexts/tournament-context";
import SetupScreen from "@/components/screens/setup-screen";
import CompetitionScreen from "@/components/screens/competition-screen";
import WinnerScreen from "@/components/screens/winner-screen";
import ThreeScene from "@/components/three-scene";

function TournamentOrchestrator() {
  const { state } = useTournament();

  const renderScreen = () => {
    switch (state.phase) {
      case "setup":
        return <SetupScreen />;
      case "finished":
        return <WinnerScreen />;
      case "qualification":
      case "octavos":
      case "cuartos":
      case "semifinal":
      case "final":
        return <CompetitionScreen />;
      default:
        return <SetupScreen />;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <ThreeScene />
      <div className="relative z-10 flex h-full min-h-screen w-full items-center justify-center p-4">
        {renderScreen()}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <TournamentProvider>
        <TournamentOrchestrator />
      </TournamentProvider>
    </main>
  );
}
