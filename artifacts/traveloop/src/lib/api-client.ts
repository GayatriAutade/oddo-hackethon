import { setAuthTokenGetter } from "@workspace/api-client-react";

export function initApiClient() {
  setAuthTokenGetter(() => {
    return localStorage.getItem("traveloop_token");
  });
}
