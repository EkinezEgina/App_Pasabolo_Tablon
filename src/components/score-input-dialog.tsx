"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Participant } from "@/lib/types";

const scoreSchema = z.object({
  scores: z.array(z.object({ value: z.coerce.number().min(0).max(210) })).length(8, "Debe tener 8 puntuaciones"),
});

type ScoreFormValues = z.infer<typeof scoreSchema>;

interface ScoreInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scores: number[]) => void;
  player: Participant | null;
}

export function ScoreInputDialog({ isOpen, onClose, onSubmit, player }: ScoreInputDialogProps) {
  const form = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      scores: Array(8).fill({ value: 0 }),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "scores",
  });

  const handleFormSubmit = (data: ScoreFormValues) => {
    onSubmit(data.scores.map(s => s.value));
    form.reset();
    onClose();
  };
  
  const totalScore = form.watch("scores").reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-card">
        <DialogHeader>
          <DialogTitle>Ingresar Puntuaciones para {player?.name}</DialogTitle>
          <DialogDescription>
            Ingresa la puntuación para cada una de las 8 bolas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`scores.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bola {index + 1}</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="210" {...field} className="text-center" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
             <div className="text-right text-2xl font-bold">
                Total: <span className="text-primary">{totalScore}</span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="default">
                Enviar Puntuaciones
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
