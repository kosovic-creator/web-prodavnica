import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { StavkaKorpe } from "@/types";

export interface KorpaContextType {
  stavke: StavkaKorpe[];
  setStavke: React.Dispatch<React.SetStateAction<StavkaKorpe[]>>;
  resetKorpa: () => void;
  brojStavki: number;
  setBrojStavki: (broj: number) => void;
  refreshKorpa: () => Promise<void>;
}

const KorpaContext = createContext<KorpaContextType>({
  stavke: [],
  setStavke: () => { },
  resetKorpa: () => { },
  brojStavki: 0,
  setBrojStavki: () => { },
  refreshKorpa: async () => { },
});

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
    try {
      const res = await fetch(`/api/korpa?korisnikId=${session.user.id}`);
      if (!res.ok) {
        console.error('Failed to fetch korpa:', res.statusText);
        return;
      }
      const data = await res.json();
      const stavkeData = data.stavke || [];
      setStavke(stavkeData);
      setBrojStavki(stavkeData.length);
    } catch (error) {
      console.error('Error fetching korpa:', error);
    }
  }, [session?.user?.id]);

  const resetKorpa = () => {
    setStavke([]);
    setBrojStavki(0);
    console.log('resetKorpa called');
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchBrojStavki();
    }

    const handleKorpaChange = () => {
      if (session?.user?.id) {
        fetchBrojStavki();
      }
    };

    window.addEventListener("korpaChanged", handleKorpaChange);
    return () => window.removeEventListener("korpaChanged", handleKorpaChange);
  }, [session?.user?.id, fetchBrojStavki]);

  return (
    <KorpaContext.Provider value={{ stavke, setStavke, resetKorpa, brojStavki, setBrojStavki, refreshKorpa: fetchBrojStavki }}>
      {children}
    </KorpaContext.Provider>
  );
};