import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { JourneyEntry } from "../backend.d.ts";
import {
  type JourneyEntryWithId,
  msToNano,
  nanoToMs,
  useAddJourneyEntry,
  useUpdateJourneyEntry,
} from "../hooks/useQueries";

interface JourneyDialogProps {
  open: boolean;
  onClose: () => void;
  editItem?: JourneyEntryWithId;
}

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  skinCondition: "",
  hydrationLevel: "3",
  breakoutsCount: "0",
  overallRating: "3",
  notes: "",
};

const levelOptions = ["1", "2", "3", "4", "5"];

export default function JourneyDialog({
  open,
  onClose,
  editItem,
}: JourneyDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const addMutation = useAddJourneyEntry();
  const updateMutation = useUpdateJourneyEntry();
  const isPending = addMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (editItem) {
      const e = editItem.entry;
      setForm({
        date: new Date(nanoToMs(e.date)).toISOString().slice(0, 10),
        skinCondition: e.skinCondition,
        hydrationLevel: e.hydrationLevel.toString(),
        breakoutsCount: e.breakoutsCount.toString(),
        overallRating: e.overallRating.toString(),
        notes: e.notes,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editItem]);

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();

    const entry: JourneyEntry = {
      date: msToNano(new Date(form.date).getTime()),
      skinCondition: form.skinCondition.trim(),
      hydrationLevel: BigInt(Number.parseInt(form.hydrationLevel) || 3),
      breakoutsCount: BigInt(Number.parseInt(form.breakoutsCount) || 0),
      overallRating: BigInt(Number.parseInt(form.overallRating) || 3),
      notes: form.notes.trim(),
    };

    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, entry });
        toast.success("Entry updated!");
      } else {
        await addMutation.mutateAsync(entry);
        toast.success("Journal entry added!");
      }
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="journey.dialog"
        className="max-w-md font-body"
        aria-describedby="journey-dialog-desc"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {editItem ? "Edit Entry" : "New Journal Entry"}
          </DialogTitle>
          <DialogDescription id="journey-dialog-desc">
            {editItem
              ? "Update your skin journal entry."
              : "Record how your skin feels today."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="journey-date">Date</Label>
            <Input
              id="journey-date"
              data-ocid="journey.date.input"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="journey-condition">Skin Condition</Label>
            <Textarea
              id="journey-condition"
              data-ocid="journey.textarea"
              placeholder="How does your skin feel today? Any changes you noticed?"
              rows={3}
              value={form.skinCondition}
              onChange={(e) =>
                setForm((f) => ({ ...f, skinCondition: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="journey-hydration">Hydration</Label>
              <Select
                value={form.hydrationLevel}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, hydrationLevel: v }))
                }
              >
                <SelectTrigger
                  id="journey-hydration"
                  data-ocid="journey.hydration.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}/5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="journey-breakouts">Breakouts</Label>
              <Input
                id="journey-breakouts"
                data-ocid="journey.breakouts.input"
                type="number"
                min="0"
                placeholder="0"
                value={form.breakoutsCount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, breakoutsCount: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="journey-rating">Overall</Label>
              <Select
                value={form.overallRating}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, overallRating: v }))
                }
              >
                <SelectTrigger
                  id="journey-rating"
                  data-ocid="journey.rating.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}/5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="journey-notes">Additional Notes</Label>
            <Textarea
              id="journey-notes"
              data-ocid="journey.notes.textarea"
              placeholder="Anything else worth noting…"
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="journey.cancel_button"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="journey.submit_button"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : editItem ? (
                "Update Entry"
              ) : (
                "Save Entry"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
