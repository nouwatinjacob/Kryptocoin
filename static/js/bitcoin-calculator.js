// Bitcoin Calculator JavaScript
class BitcoinCalculator {
    constructor() {
        this.apiUrl = 'https://api.coingecko.com/api/v3/simple/price';
        this.currencies = {
            'USD': { symbol: '$', name: 'US Dollar' },
            'EUR': { symbol: '€', name: 'Euro' },
            'GBP': { symbol: '£', name: 'British Pound' },
            'JPY': { symbol: '¥', name: 'Japanese Yen' },
            'AUD': { symbol: 'A$', name: 'Australian Dollar' },
            'CAD': { symbol: 'C$', name: 'Canadian Dollar' },
            'CHF': { symbol: 'CHF', name: 'Swiss Franc' },
            'CNY': { symbol: '¥', name: 'Chinese Yuan' },
            'INR': { symbol: '₹', name: 'Indian Rupee' },
            'KRW': { symbol: '₩', name: 'South Korean Won' },
            'NGN': { symbol: '₦', name: 'Nigerian Naira' },
            'ZAR': { symbol: 'R', name: 'South African Rand' }
        };
        this.currentPrices = {};
        this.updateInterval = null;
        
        this.init();
    }

    async init() {
        this.setupDOM();
        await this.fetchBitcoinPrices();
        this.setupEventListeners();
        this.startAutoUpdate();
        this.calculate(); // Initial calculation
    }

    setupDOM() {
        const currencySelect = document.getElementById('currency-select');
        
        // Populate currency dropdown
        Object.keys(this.currencies).forEach(code => {
            const option = document.createElement('option');
            option.value = code.toLowerCase();
            option.textContent = code;
            currencySelect.appendChild(option);
        });

        // Set default currency to USD
        currencySelect.value = 'usd';
    }

    async fetchBitcoinPrices() {
        try {
            const currencyList = Object.keys(this.currencies).map(c => c.toLowerCase()).join(',');
            const response = await fetch(`${this.apiUrl}?ids=bitcoin&vs_currencies=${currencyList}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.currentPrices = data.bitcoin;
            
            this.updateLastUpdatedTime();
            
        } catch (error) {
            console.error('Error fetching Bitcoin prices:', error);
            this.showError('Unable to fetch current Bitcoin prices. Please try again later.');
        }
    }

    setupEventListeners() {
        const btcInput = document.querySelector('input[name="btc-calculator-value"]');
        const currencySelect = document.getElementById('currency-select');
        const resultInput = document.querySelector('input[name="btc-calculator-result"]');

        // Calculate when BTC amount changes
        btcInput.addEventListener('input', () => {
            this.calculate();
        });

        // Calculate when currency changes
        currencySelect.addEventListener('change', () => {
            this.calculate();
        });

        // Allow reverse calculation (when result input changes)
        resultInput.addEventListener('input', () => {
            this.reverseCalculate();
        });

        // Prevent form submission
        document.getElementById('bitcoin-calculator').addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    calculate() {
        const btcAmount = parseFloat(document.querySelector('input[name="btc-calculator-value"]').value) || 0;
        const selectedCurrency = document.getElementById('currency-select').value;
        const resultInput = document.querySelector('input[name="btc-calculator-result"]');

        if (this.currentPrices[selectedCurrency]) {
            const result = btcAmount * this.currentPrices[selectedCurrency];
            const currencyCode = selectedCurrency.toUpperCase();
            const symbol = this.currencies[currencyCode].symbol;
            
            // Format the result based on currency
            let formattedResult;
            if (currencyCode === 'JPY' || currencyCode === 'KRW') {
                formattedResult = `${symbol}${Math.round(result).toLocaleString()}`;
            } else {
                formattedResult = `${symbol}${result.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            }
            
            resultInput.value = formattedResult;
        }
    }

    reverseCalculate() {
        const resultInput = document.querySelector('input[name="btc-calculator-result"]');
        const btcInput = document.querySelector('input[name="btc-calculator-value"]');
        const selectedCurrency = document.getElementById('currency-select').value;

        // Extract numeric value from formatted result
        const numericValue = parseFloat(resultInput.value.replace(/[^\d.-]/g, '')) || 0;

        if (this.currentPrices[selectedCurrency] && this.currentPrices[selectedCurrency] > 0) {
            const btcAmount = numericValue / this.currentPrices[selectedCurrency];
            btcInput.value = btcAmount.toFixed(8); // Bitcoin precision
        }
    }

    startAutoUpdate() {
        // Update every 15 minutes (900,000 milliseconds)
        this.updateInterval = setInterval(() => {
            this.fetchBitcoinPrices().then(() => {
                this.calculate(); // Recalculate with new prices
            });
        }, 900000);
    }

    updateLastUpdatedTime() {
        const infoElement = document.querySelector('.info');
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZoneName: 'short'
        });
        
        if (infoElement) {
            infoElement.innerHTML = `<i>* Data updated every 15 minutes | Last updated: ${timeString}</i>`;
        }
    }

    showError(message) {
        const resultInput = document.querySelector('input[name="btc-calculator-result"]');
        resultInput.value = 'Error loading data';
        resultInput.style.color = '#ff4444';
        
        setTimeout(() => {
            resultInput.style.color = '';
        }, 3000);
    }

    // Public method to manually refresh prices
    async refresh() {
        await this.fetchBitcoinPrices();
        this.calculate();
    }

    // Cleanup method
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bitcoinCalculator = new BitcoinCalculator();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.bitcoinCalculator) {
        window.bitcoinCalculator.destroy();
    }
});
