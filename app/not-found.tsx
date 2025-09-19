import { Suspense } from "react";

import { NotFound } from "@/components/shared/not-found-page";

export default function NotFoundPage() {
  return (
    <Suspense>
      <NotFound />
    </Suspense>
  );
}
