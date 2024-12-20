"use client";

import { errorHandlingFetcher, RedirectError } from "@/lib/fetcher";
import useSWR from "swr";
import { Modal } from "../Modal";
import { useCallback, useEffect, useState } from "react";
import { getSecondsUntilExpiration } from "@/lib/time";
import { User } from "@/lib/types";
import { mockedRefreshToken, refreshToken } from "./refreshUtils";
import { CUSTOM_REFRESH_URL } from "@/lib/constants";

export const HealthCheckBanner = () => {
  const { error } = useSWR("/api/health", errorHandlingFetcher);
  const [expired, setExpired] = useState(false);
  const [secondsUntilExpiration, setSecondsUntilExpiration] = useState<
    number | null
  >(null);
  const { data: user, mutate: mutateUser } = useSWR<User>(
    "/api/me",
    errorHandlingFetcher
  );

  const updateExpirationTime = useCallback(async () => {
    const updatedUser = await mutateUser();

    if (updatedUser) {
      const seconds = getSecondsUntilExpiration(updatedUser);
      setSecondsUntilExpiration(seconds);
      console.debug(`Updated seconds until expiration:! ${seconds}`);
    }
  }, [mutateUser]);

  useEffect(() => {
    updateExpirationTime();
  }, [user, updateExpirationTime]);

  useEffect(() => {
    if (CUSTOM_REFRESH_URL) {
      const refreshUrl = CUSTOM_REFRESH_URL;
      let refreshTimeoutId: NodeJS.Timeout;
      let expireTimeoutId: NodeJS.Timeout;

      const attemptTokenRefresh = async () => {
        try {
          // NOTE: This is a mocked refresh token for testing purposes.
          // const refreshTokenData = mockedRefreshToken();

          const refreshTokenData = await refreshToken(refreshUrl);

          const response = await fetch(
            "/api/enterprise-settings/refresh-token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(refreshTokenData),
            }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          await new Promise((resolve) => setTimeout(resolve, 4000));

          await mutateUser(undefined, { revalidate: true });
          updateExpirationTime();
        } catch (error) {
          console.error("Error refreshing token:", error);
        }
      };

      const scheduleRefreshAndExpire = () => {
        if (secondsUntilExpiration !== null) {
          const timeUntilRefresh = (secondsUntilExpiration + 0.5) * 1000;
          refreshTimeoutId = setTimeout(attemptTokenRefresh, timeUntilRefresh);

          const timeUntilExpire = (secondsUntilExpiration + 10) * 1000;
          expireTimeoutId = setTimeout(() => {
            console.debug("Session expired. Setting expired state to true.");
            setExpired(true);
          }, timeUntilExpire);
        }
      };

      scheduleRefreshAndExpire();

      return () => {
        clearTimeout(refreshTimeoutId);
        clearTimeout(expireTimeoutId);
      };
    }
  }, [secondsUntilExpiration, user, mutateUser, updateExpirationTime]);

  if (!error && !expired) {
    return null;
  }

  console.debug(
    `Rendering HealthCheckBanner. Error: ${error}, Expired: ${expired}`
  );

  if (error instanceof RedirectError || expired) {
    return (
      <Modal
        width="w-1/4"
        className="overflow-y-hidden flex flex-col"
        title="You've been logged out"
      >
        <div className="flex flex-col gap-y-4">
          <p className="text-sm">
            Your session has expired. Please log in again to continue.
          </p>
          <a
            href="/auth/login"
            className="w-full mt-4 mx-auto rounded-md text-text-200 py-2 bg-background-900 text-center hover:bg-emphasis animtate duration-300 transition-bg"
          >
            Log in
          </a>
        </div>
      </Modal>
    );
  } else {
    return (
      <div className="fixed top-0 left-0 z-[101] w-full text-xs mx-auto bg-gradient-to-r from-red-900 to-red-700 p-2 rounded-sm border-hidden text-text-200">
        <p className="font-bold pb-1">The backend is currently unavailable.</p>

        <p className="px-1">
          If this is your initial setup or you just updated your Buddy
          deployment, this is likely because the backend is still starting up.
          Give it a minute or two, and then refresh the page. If that does not
          work, make sure the backend is setup and/or contact an administrator.
        </p>
      </div>
    );
  }
};
