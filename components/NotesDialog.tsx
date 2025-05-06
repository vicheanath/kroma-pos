import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  saleNotes: string;
  setSaleNotes: (notes: string) => void;
  saveNotes: () => void;
}

export default function NotesDialog({
  isOpen,
  onClose,
  saleNotes,
  setSaleNotes,
  saveNotes,
}: NotesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sale Notes</DialogTitle>
          <DialogDescription>
            Add notes to this sale for reference.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="sale-notes">Notes</Label>
            <Textarea
              id="sale-notes"
              placeholder="Enter notes about this sale..."
              value={saleNotes}
              onChange={(e) => setSaleNotes(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={saveNotes}>Save Notes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
