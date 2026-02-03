import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const InvestmentCard = ({
  totalResonanceInvested,
}: {
  totalResonanceInvested: number;
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Total Investment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">
          {totalResonanceInvested.toFixed(2)} RES
        </div>
        <div className="text-xs text-muted-foreground">
          Lifetime RESONANCE invested
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentCard;
