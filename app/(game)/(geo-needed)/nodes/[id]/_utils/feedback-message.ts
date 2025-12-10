import { MiningState } from "@/lib/schema/mining-session";

type FeedbackMessageParams = {
  miningState: MiningState;
  distanceMeters: number | null;
  allowedDistanceMeters?: number;
};

export const getFeedbackMessage = ({
  miningState,
  distanceMeters,
  allowedDistanceMeters = 100,
}: FeedbackMessageParams) => {
  let feedbackMessage: string | null = null;

  switch (miningState) {
    case MiningState.Eligible:
      feedbackMessage = "You are within range — ready to start mining.";
      break;
    case MiningState.TooFar:
      feedbackMessage =
        distanceMeters === null
          ? "You are not close to this node."
          : distanceMeters < 1000
          ? `Move closer by ${Math.max(
              0,
              Math.round(distanceMeters - allowedDistanceMeters)
            )} m.`
          : `Move closer by ${Math.max(
              0,
              Math.round(distanceMeters - allowedDistanceMeters) / 1000
            )} km.`;
      break;
    case MiningState.NodeFull:
      feedbackMessage = "This node has reached its maximum capacity.";
      break;
    case MiningState.NodeClosed:
      feedbackMessage = "This node is currently closed for mining.";
      break;
    case MiningState.Pending:
      feedbackMessage = "You have a mining session in progress for this node.";
      break;
    case MiningState.Completed:
      feedbackMessage = "You have already mined this node.";
      break;
    case MiningState.Tune:
      feedbackMessage = "You’re in range — ready to mine this node!";
      break;
    case MiningState.NoLocation:
      feedbackMessage =
        "Location unavailable. Please enable location services.";
      break;
    case MiningState.Cancelled:
      feedbackMessage =
        "Your previous mining session for this node was cancelled and cannot be restarted.";
      break;
    default:
      feedbackMessage = null;
  }
  return feedbackMessage;
};
