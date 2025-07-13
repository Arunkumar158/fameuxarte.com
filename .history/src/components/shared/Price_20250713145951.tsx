
import { useCurrency } from "@/contexts/CurrencyContext";

interface PriceProps {
  amount: number;
  className?: string;
}

export function Price({ amount, className = "" }: PriceProps) {
  const { currency, convertPrice } = useCurrency();
  
  const displayAmount = convertPrice(amount);
  
  // Use Intl.NumberFormat for proper currency formatting
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency.code,
  }).format(displayAmount);
  
  return (
    <span className={className}>
      {formattedPrice}
    </span>
  );
}
