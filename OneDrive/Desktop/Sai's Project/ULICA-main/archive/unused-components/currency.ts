// Multi-currency support
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'KRW';

export interface CurrencyConfig {
  code: Currency;
  name: string;
  symbol: string;
  rate: number; // Exchange rate from base currency (INR)
  locale: string;
  decimalPlaces: number;
}

export const supportedCurrencies: CurrencyConfig[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 1, locale: 'en-IN', decimalPlaces: 0 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.012, locale: 'en-US', decimalPlaces: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.011, locale: 'en-EU', decimalPlaces: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.0095, locale: 'en-GB', decimalPlaces: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 1.8, locale: 'ja-JP', decimalPlaces: 0 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 0.016, locale: 'en-CA', decimalPlaces: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 0.018, locale: 'en-AU', decimalPlaces: 2 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.011, locale: 'de-CH', decimalPlaces: 2 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 0.087, locale: 'zh-CN', decimalPlaces: 2 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 16, locale: 'ko-KR', decimalPlaces: 0 },
];

export class CurrencyService {
  private currentCurrency: Currency = 'INR';
  private exchangeRates: Map<Currency, number> = new Map();
  private lastUpdated: Date | null = null;

  constructor() {
    this.loadCurrency();
    this.loadExchangeRates();
  }

  private loadCurrency(): void {
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('ulica_currency') as Currency;
      if (savedCurrency && supportedCurrencies.some(curr => curr.code === savedCurrency)) {
        this.currentCurrency = savedCurrency;
      }
    }
  }

  private async loadExchangeRates(): Promise<void> {
    try {
      // In a real implementation, you would fetch from an exchange rate API
      // For now, we'll use static rates
      const rates = new Map<Currency, number>();
      supportedCurrencies.forEach(currency => {
        rates.set(currency.code, currency.rate);
      });
      this.exchangeRates = rates;
      this.lastUpdated = new Date();
    } catch (error) {
      console.error('Failed to load exchange rates:', error);
      // Fallback to static rates
      const rates = new Map<Currency, number>();
      supportedCurrencies.forEach(currency => {
        rates.set(currency.code, currency.rate);
      });
      this.exchangeRates = rates;
    }
  }

  setCurrency(currency: Currency): void {
    this.currentCurrency = currency;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ulica_currency', currency);
    }
  }

  getCurrentCurrency(): Currency {
    return this.currentCurrency;
  }

  getSupportedCurrencies(): CurrencyConfig[] {
    return supportedCurrencies;
  }

  getCurrencyConfig(currency: Currency): CurrencyConfig | undefined {
    return supportedCurrencies.find(curr => curr.code === currency);
  }

  convertAmount(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const fromRate = this.exchangeRates.get(fromCurrency) || 1;
    const toRate = this.exchangeRates.get(toCurrency) || 1;

    // Convert to base currency (INR) first, then to target currency
    const baseAmount = amount / fromRate;
    return baseAmount * toRate;
  }

  formatAmount(amount: number, currency?: Currency): string {
    const targetCurrency = currency || this.currentCurrency;
    const config = this.getCurrencyConfig(targetCurrency);
    
    if (!config) {
      return `${amount}`;
    }

    const convertedAmount = this.convertAmount(amount, 'INR', targetCurrency);
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    }).format(convertedAmount);
  }

  formatPrice(price: number, currency?: Currency): string {
    const targetCurrency = currency || this.currentCurrency;
    const config = this.getCurrencyConfig(targetCurrency);
    
    if (!config) {
      return `₹${price}`;
    }

    const convertedAmount = this.convertAmount(price, 'INR', targetCurrency);
    
    // Round to appropriate decimal places
    const roundedAmount = Math.round(convertedAmount * Math.pow(10, config.decimalPlaces)) / Math.pow(10, config.decimalPlaces);
    
    return `${config.symbol}${roundedAmount.toLocaleString(config.locale, {
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    })}`;
  }

  getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const fromRate = this.exchangeRates.get(fromCurrency) || 1;
    const toRate = this.exchangeRates.get(toCurrency) || 1;

    return toRate / fromRate;
  }

  // Get price range for a product in different currencies
  getPriceRange(minPrice: number, maxPrice: number, currency?: Currency): { min: string; max: string } {
    const targetCurrency = currency || this.currentCurrency;
    
    return {
      min: this.formatPrice(minPrice, targetCurrency),
      max: this.formatPrice(maxPrice, targetCurrency),
    };
  }

  // Calculate shipping cost in different currencies
  calculateShippingCost(baseShippingCost: number, currency?: Currency): string {
    return this.formatPrice(baseShippingCost, currency);
  }

  // Get currency symbol
  getCurrencySymbol(currency?: Currency): string {
    const targetCurrency = currency || this.currentCurrency;
    const config = this.getCurrencyConfig(targetCurrency);
    return config?.symbol || '';
  }

  // Check if currency is supported
  isCurrencySupported(currency: Currency): boolean {
    return supportedCurrencies.some(curr => curr.code === currency);
  }

  // Get last updated time for exchange rates
  getLastUpdated(): Date | null {
    return this.lastUpdated;
  }

  // Refresh exchange rates (in a real implementation, this would call an API)
  async refreshExchangeRates(): Promise<void> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would fetch from an API like:
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
      // const data = await response.json();
      // Update this.exchangeRates with real data
      
      this.lastUpdated = new Date();
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error);
    }
  }
}

export const currencyService = new CurrencyService();

// Utility functions
export function formatPrice(price: number, currency?: Currency): string {
  return currencyService.formatPrice(price, currency);
}

export function convertAmount(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  return currencyService.convertAmount(amount, fromCurrency, toCurrency);
}

export function getCurrencySymbol(currency?: Currency): string {
  return currencyService.getCurrencySymbol(currency);
}

export function isCurrencySupported(currency: Currency): boolean {
  return currencyService.isCurrencySupported(currency);
}
