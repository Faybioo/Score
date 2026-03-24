import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export const useUserSync = () => {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    const syncWithBackend = async () => {
      if (isAuthenticated && user && !isSynced) {
        try {
          // get auth0 jwt token
          const token = await getAccessTokenSilently();

          // send to go
          const response = await fetch("http://localhost:8080/api/user/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              auth0_id: user.sub,
              email: user.email,
            }),
          });

          if (response.ok) {
            console.log("User successfully synced to database");
            setIsSynced(true);
          }
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      }
    };

    syncWithBackend();
  }, [isAuthenticated, user, getAccessTokenSilently, isSynced]);

  return { isSynced };
};