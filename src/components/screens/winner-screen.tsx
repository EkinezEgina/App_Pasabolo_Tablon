"use client";

import { useTournament } from "@/contexts/tournament-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Crown, RotateCcw, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";

export default function WinnerScreen() {
  const { state, dispatch } = useTournament();
  const { winner } = state;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <Card className="w-full max-w-md text-center bg-card/80 backdrop-blur-sm shadow-2xl">
        <CardHeader>
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, -5, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "mirror" }}
          >
            <Crown className="w-24 h-24 mx-auto text-amber-400" />
          </motion.div>
          <CardTitle className="text-4xl font-extrabold mt-4">
            ¡Felicitaciones!
          </CardTitle>
          <CardDescription className="text-lg">
            El campeón del torneo es
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-primary text-primary-foreground p-4 rounded-lg"
            >
            <h2 className="text-5xl font-bold">{winner?.name || "N/A"}</h2>
          </motion.div>
          
          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: -20, opacity: [0, 1, 0] }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 1, repeat: Infinity }}
                >
                    <PartyPopper className="w-8 h-8 text-accent" />
                </motion.div>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => dispatch({ type: "RESET_TOURNAMENT" })}
          >
            <RotateCcw className="mr-2 h-5 w-5" /> Iniciar Nuevo Torneo
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
