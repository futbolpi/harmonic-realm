import React from "react";
import { NextStepProvider as Provider, NextStep } from "nextstepjs";

import { tutorialSteps } from "@/lib/tutorials/steps";
import { CustomNextStepCard } from "@/components/shared/custom-nextstep-card";

const NextStepProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <NextStep steps={tutorialSteps} cardComponent={CustomNextStepCard}>
        {children}
      </NextStep>
    </Provider>
  );
};

export default NextStepProvider;
