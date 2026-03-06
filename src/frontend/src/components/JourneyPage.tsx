import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Droplets, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type JourneyEntryWithId,
  nanoToMs,
  useDeleteJourneyEntry,
  useGetAllJourneyEntries,
} from "../hooks/useQueries";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import JourneyDialog from "./JourneyDialog";
import StarRating from "./StarRating";

export default function JourneyPage() {
  const { data: entries, isLoading } = useGetAllJourneyEntries();
  const deleteEntry = useDeleteJourneyEntry();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<JourneyEntryWithId | undefined>();
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const sorted = entries
    ? [...entries].sort(
        (a, b) => nanoToMs(b.entry.date) - nanoToMs(a.entry.date),
      )
    : [];

  const handleEdit = (item: JourneyEntryWithId) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditItem(undefined);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteEntry.mutateAsync(deleteId);
      toast.success("Entry deleted.");
    } catch {
      toast.error("Failed to delete entry.");
    }
    setDeleteId(null);
  };

  // Group by month for visual timeline
  const grouped = sorted.reduce<Record<string, JourneyEntryWithId[]>>(
    (acc, item) => {
      const key = new Date(nanoToMs(item.entry.date)).toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        },
      );
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Skin Journey
          </h1>
          <p className="text-muted-foreground font-body text-sm mt-1">
            Your ongoing skin diary
          </p>
        </div>
        <Button
          data-ocid="journey.add.primary_button"
          onClick={handleAdd}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Stats summary */}
      {!isLoading && sorted.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total Entries",
              value: sorted.length,
              icon: BookOpen,
            },
            {
              label: "Avg. Rating",
              value: `${(sorted.reduce((s, e) => s + Number(e.entry.overallRating), 0) / sorted.length).toFixed(1)}/5`,
              icon: Star,
            },
            {
              label: "Avg. Hydration",
              value: `${(sorted.reduce((s, e) => s + Number(e.entry.hydrationLevel), 0) / sorted.length).toFixed(1)}/5`,
              icon: Droplets,
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="shadow-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-body">
                        {stat.label}
                      </p>
                      <p className="font-display font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-4" data-ocid="journey.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          data-ocid="journey.empty_state"
          className="py-16 flex flex-col items-center text-center text-muted-foreground font-body"
        >
          <BookOpen className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-semibold text-base text-foreground mb-1">
            Your journey starts here
          </p>
          <p className="text-sm mb-4">
            Start recording your daily skin condition to track your progress
            over time.
          </p>
          <Button
            data-ocid="journey.empty.add_button"
            onClick={handleAdd}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Write First Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, monthEntries]) => (
            <div key={month}>
              <h2 className="text-sm font-body font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-3">
                <span>{month}</span>
                <span className="flex-1 h-px bg-border" />
                <span className="text-xs normal-case tracking-normal">
                  {monthEntries.length}{" "}
                  {monthEntries.length === 1 ? "entry" : "entries"}
                </span>
              </h2>

              <div className="space-y-3">
                <AnimatePresence>
                  {monthEntries.map((item, i) => {
                    const date = new Date(nanoToMs(item.entry.date));
                    const globalIndex = sorted.findIndex(
                      (e) => e.id === item.id,
                    );

                    return (
                      <motion.div
                        key={item.id.toString()}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.05 }}
                        data-ocid={`journey.item.${globalIndex + 1}`}
                      >
                        <Card className="shadow-card hover:shadow-soft transition-all group">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {/* Date blob */}
                              <div className="shrink-0 w-12 text-center">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                                  <span className="font-display font-bold text-primary text-lg leading-none">
                                    {date.getDate()}
                                  </span>
                                  <span className="text-[10px] font-body text-primary/70 uppercase tracking-wide">
                                    {date.toLocaleDateString("en-US", {
                                      weekday: "short",
                                    })}
                                  </span>
                                </div>
                              </div>

                              {/* Entry content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1">
                                    {item.entry.skinCondition ? (
                                      <p className="font-body text-sm text-foreground line-clamp-2">
                                        {item.entry.skinCondition}
                                      </p>
                                    ) : (
                                      <p className="font-body text-sm text-muted-foreground italic">
                                        No condition note
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      data-ocid={`journey.edit_button.${globalIndex + 1}`}
                                      variant="ghost"
                                      size="icon"
                                      className="w-7 h-7 text-muted-foreground hover:text-primary"
                                      onClick={() => handleEdit(item)}
                                      aria-label="Edit entry"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      data-ocid={`journey.delete_button.${globalIndex + 1}`}
                                      variant="ghost"
                                      size="icon"
                                      className="w-7 h-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => setDeleteId(item.id)}
                                      aria-label="Delete entry"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Metrics row */}
                                <div className="flex flex-wrap items-center gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-xs font-body text-muted-foreground">
                                      Hydration
                                    </span>
                                    <StarRating
                                      value={Number(item.entry.hydrationLevel)}
                                      className="gap-0.5"
                                    />
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="text-xs font-body text-muted-foreground">
                                      Rating
                                    </span>
                                    <StarRating
                                      value={Number(item.entry.overallRating)}
                                      className="gap-0.5"
                                    />
                                  </div>

                                  {Number(item.entry.breakoutsCount) > 0 && (
                                    <span className="text-xs font-body font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                                      {item.entry.breakoutsCount.toString()}{" "}
                                      breakout
                                      {Number(item.entry.breakoutsCount) > 1
                                        ? "s"
                                        : ""}
                                    </span>
                                  )}
                                </div>

                                {item.entry.notes && (
                                  <p className="mt-2 text-xs text-muted-foreground font-body italic line-clamp-1">
                                    {item.entry.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      <JourneyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editItem={editItem}
      />
      <ConfirmDeleteDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isPending={deleteEntry.isPending}
        title="Delete journal entry?"
        description="This will permanently remove this skin journal entry."
      />
    </div>
  );
}
