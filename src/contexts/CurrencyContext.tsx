
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Define supported currencies with their symbols and codes
export type CurrencyCode = "INR" | "USD" | "GBP" | "EUR" | "JPY" | "AUD";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee" },
  USD: { code: "USD", symbol: "$", name: "US Dollar" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar" }
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (priceInINR: number) => number;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  // Default to INR
  const [currency, setCurrency] = useLocalStorage<Currency>("currency", CURRENCIES.INR);
  const [conversionRates, setConversionRates] = useLocalStorage<Record<string, number>>("conversionRates", {});
  const [loading, setLoading] = useState(true);

  // Detect user's location and set currency on mount
  useEffect(() => {
    const detectUserCurrency = async () => {
      try {
        // Check if we have a user-selected currency already
        if (localStorage.getItem("userSelectedCurrency") === "true") {
          setLoading(false);
          return; // User has manually selected a currency, don't override
        }

        // Try to get location from IP
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        // Map country code to currency
        let detectedCurrency: Currency | undefined;

        // Simple mapping of common countries to currencies
        if (data.country === "US") detectedCurrency = CURRENCIES.USD;
        else if (["GB", "UK"].includes(data.country)) detectedCurrency = CURRENCIES.GBP;
        else if (["DE", "FR", "IT", "ES"].includes(data.country)) detectedCurrency = CURRENCIES.EUR;
        else if (data.country === "JP") detectedCurrency = CURRENCIES.JPY;
        else if (data.country === "AU") detectedCurrency = CURRENCIES.AUD;
        else if (data.country === "IN") detectedCurrency = CURRENCIES.INR;
        
        // Set detected currency
        if (detectedCurrency) {
          setCurrency(detectedCurrency);
        }
      } catch (error) {
        console.error("Failed to detect user's location:", error);
        // Fallback to INR
      } finally {
        setLoading(false);
      }
    };

    // Fetch conversion rates
    const fetchConversionRates = async () => {
      try {
        // Use a free currency conversion API
        // Note: In production, you would use a paid API with better reliability
        const response = await fetch(
          "https://open.er-api.com/v6/latest/INR"
        );
        const data = await response.json();
        
        if (data.rates) {
          setConversionRates(data.rates);
        }
      } catch (error) {
        console.error("Failed to fetch conversion rates:", error);
      }
    };

    detectUserCurrency();
    fetchConversionRates();
  }, []);

  // Function to convert price from INR to selected currency
  const convertPrice = (priceInINR: number): number => {
    if (!conversionRates || !currency) return priceInINR;
    
    // If currency is INR, return original price
    if (currency.code === "INR") return priceInINR;
    
    // Convert using exchange rate
    const rate = conversionRates[currency.code];
    if (!rate) return priceInINR;
    
    return priceInINR * rate;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
