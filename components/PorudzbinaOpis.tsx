import { useTranslation } from 'react-i18next';

interface PorudzbinaOpisProps {
  opis: string;
}

export default function PorudzbinaOpis({ opis }: PorudzbinaOpisProps) {
  const { t } = useTranslation('porudzbine');
  // Očekuje format: 'productPurchased 16.10.2025'
  const [key, ...dateParts] = opis.split(' ');
  const date = dateParts.join(' ');
  return <span>{t(key)} {date}</span>;
}
