import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminRedirector() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.uloga === "admin" && router) {
      router.replace("/admin");
    }
  }, [session, status, router]);

  return null;
}
