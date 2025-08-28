import { Loader2 } from "lucide-react";

const StakeLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading stake details...</p>
    </div>
  );
};

export default StakeLoading;
