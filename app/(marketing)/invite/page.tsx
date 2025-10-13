import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Check } from "lucide-react";


import { getReferrer } from "@/lib/api-helpers/server/users";
import { LinkCards } from "./_components/link-cards";
import { searchParamsCache } from "./search-params";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function InvitePage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const { ref } = searchParamsCache.parse(searchParams);

  const referrer = ref ? await getReferrer(ref) : null;

  if (!referrer) {
    return (
      <div className="mx-auto flex h-full max-w-xl flex-1 flex-col items-center justify-center gap-4 my-4 p-2">
        <h1 className="font-semibold text-2xl">Invitation</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Frequency Unrecognized</AlertTitle>
          <AlertDescription>
            {`No active Pioneer responds to '@${ref ?? ""}'. The Lattice cannot verify this harmonic signature. You may still join as an independent Pioneer.`}
          </AlertDescription>
        </Alert>
        <Separator className="my-4" />
        <p className="text-muted-foreground">Quick Links </p>
        <LinkCards />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-xl flex-1 flex-col items-center justify-center gap-4 my-4 p-2">
      <h1 className="font-semibold text-2xl">Echo Detected</h1>
      <Alert>
        <Check className="h-4 w-4" />
        <AlertTitle>Harmonic Signature Verified</AlertTitle>
        <AlertDescription>
          {`You've tuned into @${referrer.username}'s harmonic frequency. Accept their guidance to begin your journey through the infinite digits of Pi.`}
        </AlertDescription>
      </Alert>
      <Separator className="my-4" />
      <p className="text-muted-foreground">Quick Links</p>
      <LinkCards  />
    </div>
  );
}
