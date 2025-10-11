"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifikacijaEmail() {
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get("token") : null;
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("Token nije prosleđen.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/auth/verifikacija?token=${token}`);
        const data = await res.json();
        if (data.success) {
          setStatus("Email je uspešno verifikovan. Možete se prijaviti.");
        } else {
          setStatus(data.error || "Došlo je do greške.");
        }
      } catch {
        setStatus("Došlo je do greške.");
      }
      setLoading(false);
    }
    verify();
  }, [token]);

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", textAlign: "center" }}>
      <h2>Verifikacija emaila</h2>
      {loading ? <p>Proveravam...</p> : <p>{status}</p>}
    </div>
  );
}
