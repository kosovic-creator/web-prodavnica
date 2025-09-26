"use client";
import { Suspense } from "react";
import VerifikacijaEmail from "./VerifikacijaEmail";

export default function VerifikacijaPage() {
  return (
    <Suspense fallback={<div style={{textAlign: 'center', marginTop: 40}}><p>Proveravam...</p></div>}>
      <VerifikacijaEmail />
    </Suspense>
  );
}
