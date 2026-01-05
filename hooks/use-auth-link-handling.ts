import { useEffect, useCallback } from "react";
import * as Linking from "expo-linking";
import { handleMagicLink } from "@/services/firebase/firebaseAuth";
import { User } from "firebase/auth";

interface DeepLinkEvent {
  url: string;
}

/**
 * Hook pour écouter les liens Firebase Magic Link
 * @param onSuccessCallback - fonction appelée quand l'utilisateur est connecté
 */
export function useAuthLinkHandling(onSuccessCallback: (user: User) => void): void {
  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (!url) return;

      console.log("🔗 URL reçue :", url);

      const user = await handleMagicLink(url);
      if (user) {
        console.log("✅ Connecté :", user.email);
        onSuccessCallback(user);
      } else {
        console.warn("⚠️ Lien non valide ou expiré");
      }
    },
    [onSuccessCallback]
  );

  useEffect(() => {
    // 1️⃣ App fermée → récupère le lien initial
    Linking.getInitialURL().then((url) => handleDeepLink(url));

    // 2️⃣ App en arrière-plan → écoute des liens entrants
    const subscription = Linking.addEventListener("url", (event: DeepLinkEvent) => handleDeepLink(event.url));

    return () => subscription.remove();
  }, [handleDeepLink]);
}
