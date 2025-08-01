// Indian currency formatting utilities

/**
 * Formats a number according to Indian numbering system
 * Examples: 1,23,456 | 12,34,567 | 1,23,45,678
 */
export function formatIndianNumber(num: number): string {
  const numStr = num.toString();
  const [integerPart, decimalPart] = numStr.split('.');
  
  if (integerPart.length <= 3) {
    return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  }
  
  // For numbers > 999, apply Indian formatting
  const lastThree = integerPart.slice(-3);
  const remaining = integerPart.slice(0, -3);
  
  // Add commas every 2 digits for the remaining part (Indian system)
  const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  
  const result = `${formattedRemaining},${lastThree}`;
  return decimalPart ? `${result}.${decimalPart}` : result;
}

/**
 * Formats currency in Indian Rupees with proper symbol and formatting
 */
export function formatINR(amount: number): string {
  return `₹${formatIndianNumber(amount)}`;
}

/**
 * Converts amount to words in Indian format (lakhs, crores)
 */
export function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) { // 1 crore
    const crores = amount / 10000000;
    return `₹${formatIndianNumber(Math.round(crores * 100) / 100)} Cr`;
  } else if (amount >= 100000) { // 1 lakh
    const lakhs = amount / 100000;
    return `₹${formatIndianNumber(Math.round(lakhs * 100) / 100)} L`;
  } else {
    return formatINR(amount);
  }
}

/**
 * Parses Indian formatted number string back to number
 */
export function parseIndianNumber(formattedNumber: string): number {
  return parseFloat(formattedNumber.replace(/,/g, ''));
}