import { Calendar } from "lucide-react";

interface EmptyStateProps {
  text?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ 
  text = "Henüz içerik eklenmedi.", 
  icon,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`border rounded-xl p-6 text-sm text-muted-foreground text-center ${className}`}>
      {icon || (
        <div className="w-16 h-16 bg-gradient-to-r from-slate-400 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-white" />
        </div>
      )}
      <p className="text-slate-600 dark:text-slate-400">{text}</p>
    </div>
  );
}
