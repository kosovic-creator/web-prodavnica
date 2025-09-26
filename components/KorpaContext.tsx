import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { StavkaKorpe } from "@/types";

export interface KorpaContextType {
  stavke: StavkaKorpe[];
  setStavke: React.Dispatch<React.SetStateAction<StavkaKorpe[]>>;
  resetKorpa: () => void;
  brojStavki: number;
}

const KorpaContext = createContext<KorpaContextType | undefined>(undefined);

export const useKorpa = () => {
  const context = useContext(KorpaContext);
  if (!context) {
    throw new Error("useKorpa must be used within a KorpaProvider");
  }
  return context;
};

export const KorpaProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [stavke, setStavke] = useState<StavkaKorpe[]>([]);
  const [brojStavki, setBrojStavki] = useState(0);

  const fetchBrojStavki = React.useCallback(async () => {
    if (!session?.user?.id) {
      setStavke([]);
      setBrojStavki(0);
      return;
    }
    const res = await fetch(`/api/korpa?korisnikId=${session.user.id}`);
    const data = await res.json();
    const stavkeData = data.stavke || [];
    setStavke(stavkeData);
    setBrojStavki(stavkeData.length);
  }, [session?.user?.id]);

  const resetKorpa = () => {
    setStavke([]);
    setBrojStavki(0);
    console.log('resetKorpa called');
  };

  useEffect(() => {
    fetchBrojStavki();
    window.addEventListener("korpaChanged", fetchBrojStavki);
    return () => window.removeEventListener("korpaChanged", fetchBrojStavki);
  }, [fetchBrojStavki]);

  return (
    <KorpaContext.Provider value={{ stavke, setStavke, resetKorpa, brojStavki }}>
      {children}
    </KorpaContext.Provider>
  );
};