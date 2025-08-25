import { toast } from "sonner";

import { PiSDK } from "@/types/pi";

export const displayInterstitialAd = async (Pi: PiSDK) => {
  const isAdReadyResponse = await Pi.Ads.isAdReady("interstitial");

  if (isAdReadyResponse.ready === true) {
    return Pi.Ads.showAd("interstitial");
  }

  const requestAdResponse = await Pi.Ads.requestAd("interstitial");

  if (requestAdResponse.result !== "AD_LOADED") {
    // indicate to user that ad could not be loaded
    toast.error("Echo transmissions could not be loaded");
    return;
  }

  const showAdResponse = await Pi.Ads.showAd("interstitial");

  if (showAdResponse.result !== "AD_CLOSED") {
    // indicate to user that ad could not be displayed
    toast.error("Echo transmissions could not be displayed");
    return;
  } else return showAdResponse;
};

export const showRewardedAd = async (Pi: PiSDK) => {
  try {
    const isAdReadyResponse = await Pi.Ads.isAdReady("rewarded");

    if (isAdReadyResponse.ready === false) {
      const requestAdResponse = await Pi.Ads.requestAd("rewarded");

      if (requestAdResponse.result !== "AD_LOADED") {
        // display modal ads are temporarily unavailable and user should try again later
        toast.error("Echo transmissions could not be loaded");
        return;
      }
    }

    const showAdResponse = await Pi.Ads.showAd("rewarded");

    if (showAdResponse.result === "AD_REWARDED") {
      // reward user logic:
      // usually delegate rewarding user to your backend which would
      // firstly verify `adId` against Pi Platform API, then decide whether to
      // reward the user and rewarded user if the rewarded ad status is confirmed
      // e.g.:
      return showAdResponse.adId;
    } else {
      // fallback logic
      toast.error("Echo transmissions could not be displayed");
    }
  } catch (err) {
    // good practice to handle any potential errors
    console.log(err);
    toast.error("Echo transmissions could not be displayed");
  }
};
