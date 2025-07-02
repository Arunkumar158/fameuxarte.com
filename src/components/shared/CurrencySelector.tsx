
import { useState } from "react";
import { useCurrency, CURRENCIES, Currency } from "@/contexts/CurrencyContext";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);

  const handleCurrencyChange = (code: string) => {
    const newCurrency = CURRENCIES[code as keyof typeof CURRENCIES];
    if (newCurrency) {
      setCurrency(newCurrency);
      // Mark that user has manually selected a currency
      localStorage.setItem("userSelectedCurrency", "true");
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 px-3">
          {currency.symbol} {currency.code}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuRadioGroup 
          value={currency.code} 
          onValueChange={handleCurrencyChange}
        >
          {Object.entries(CURRENCIES).map(([code, curr]) => (
            <DropdownMenuRadioItem key={code} value={code}>
              <div className="flex items-center justify-between w-full">
                <div>
                  <span className="mr-2">{curr.symbol}</span>
                  {curr.name}
                </div>
                {currency.code === code && <Check className="h-4 w-4" />}
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
