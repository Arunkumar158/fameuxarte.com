
import { useCurrency } from "@/contexts/CurrencyContext";

interface PriceProps {
  amount: number;
  className?: string;
}

export function Price({ amount, className = "" }: PriceProps) {
  const { currency, convertPrice } = useCurrency();
  
  const displayAmount = convertPrice(amount);
  
  return (
    <span className={className}>
      {currency.symbol}
      {displayAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}
