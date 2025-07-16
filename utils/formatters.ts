/**
 * Formate un montant avec des espaces aux milliers
 * @param amount - Le montant à formater
 * @param currency - La devise (par défaut '€')
 * @returns Le montant formaté (ex: "1 234,56 €")
 */
export const formatAmount = (amount: number | undefined | null, currency: string = '€'): string => {
  // Gérer les valeurs undefined ou null
  if (amount === undefined || amount === null) {
    return `0,00 ${currency}`;
  }
  
  // Convertir en string avec 2 décimales
  const formatted = amount.toFixed(2);
  
  // Séparer la partie entière et décimale
  const [integerPart, decimalPart] = formatted.split('.');
  
  // Ajouter des espaces aux milliers
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  // Recombiner avec la partie décimale et la devise
  return `${formattedInteger},${decimalPart} ${currency}`;
};

/**
 * Formate un montant sans devise
 * @param amount - Le montant à formater
 * @returns Le montant formaté (ex: "1 234,56")
 */
export const formatAmountWithoutCurrency = (amount: number | undefined | null): string => {
  // Gérer les valeurs undefined ou null
  if (amount === undefined || amount === null) {
    return '0,00';
  }
  
  const formatted = amount.toFixed(2);
  const [integerPart, decimalPart] = formatted.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formattedInteger},${decimalPart}`;
}; 