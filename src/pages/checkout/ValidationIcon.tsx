import { Check, X } from "lucide-react";

interface ValidationIconProps {
  field: string;
  touchedFields: Record<string, boolean>;
  validationErrors: Record<string, string>;
}

export const ValidationIcon = ({ field, touchedFields, validationErrors }: ValidationIconProps) => {
  if (!touchedFields[field]) return null;

  if (validationErrors[field]) {
    return <X className="h-4 w-4 text-destructive absolute right-3 top-1/2 -translate-y-1/2" />;
  }

  return <Check className="h-4 w-4 text-success absolute right-3 top-1/2 -translate-y-1/2" />;
};
