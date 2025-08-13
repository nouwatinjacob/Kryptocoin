// Live Bitcoin Portfolio Calculator
// This script fetches live BTC price and updates portfolio values based on 1 BTC equivalent

class BitcoinPortfolioCalculator {
    constructor() {
        this.btcAmount = 1; // Portfolio equivalent to 1 BTC
        this.lastPrice = null;
        this.priceChangePercent = 0;
        this.updateInterval = 30000; // Update every 30 seconds
        this.init();
    }

    async init() {
        await this.fetchBitcoinPrice();
        this.updatePortfolioDisplay();
        this.startPeriodicUpdates();
    }

    async fetchBitcoinPrice() {
        try {
            // Using CoinGecko API (free, no API key required)
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
            const data = await response.json();
            
            const newPrice = data.bitcoin.usd;
            this.priceChangePercent = data.bitcoin.usd_24h_change || 0;
            
            // Calculate price change from last update
            if (this.lastPrice) {
                const priceChange = ((newPrice - this.lastPrice) / this.lastPrice) * 100;
                console.log(`BTC Price Update: $${newPrice.toLocaleString()} (${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%)`);
            }
            
            this.lastPrice = newPrice;
            return newPrice;
        } catch (error) {
            console.error('Error fetching Bitcoin price:', error);
            // Fallback to previous price or default
            return this.lastPrice || 45000; // Default fallback price
        }
    }

    calculatePortfolioValues(btcPrice) {
        const totalValue = this.btcAmount * btcPrice;
        
        // Calculate distribution (you can adjust these percentages)
        const availableBalance = totalValue * 0.658; // ~65.8%
        const inOrders = totalValue * 0.342; // ~34.2%
        
        // Calculate 24h P&L based on price change
        const dailyPnL = (this.priceChangePercent / 100) * totalValue;
        
        // Generate realistic 24h volume (between 10-20% of total value)
        const volumeMultiplier = 0.1 + Math.random() * 0.1;
        const volume24h = totalValue * volumeMultiplier;

        return {
            totalValue,
            availableBalance,
            inOrders,
            dailyPnL,
            volume24h,
            priceChange24h: this.priceChangePercent
        };
    }

    updatePortfolioDisplay() {
        if (!this.lastPrice) return;

        const values = this.calculatePortfolioValues(this.lastPrice);

        // Update total balance
        const totalBalanceElement = document.getElementById('total-balance-usd');
        if (totalBalanceElement) {
            totalBalanceElement.textContent = `$${values.totalValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }

        // Update BTC equivalent
        const btcEquivalentElement = document.getElementById('total-balance-btc');
        if (btcEquivalentElement) {
            btcEquivalentElement.textContent = this.btcAmount.toFixed(4);
        }

        // Update 24h change indicator
        const profitIndicator = document.querySelector('.profit-indicator');
        if (profitIndicator) {
            const isPositive = values.priceChange24h >= 0;
            const arrow = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
            const sign = isPositive ? '+' : '';
            
            profitIndicator.innerHTML = `
                <i class="fa ${arrow}"></i> ${sign}${values.priceChange24h.toFixed(2)}% (24h)
            `;
            
            // Update color based on positive/negative
            profitIndicator.className = `profit-indicator ${isPositive ? 'text-success' : 'text-danger'}`;
        }

        // Update stat cards
        this.updateStatCard('Available Balance', values.availableBalance);
        this.updateStatCard('In Orders', values.inOrders);
        this.updateStatCard('Today\'s P&L', values.dailyPnL, true);
        this.updateStatCard('24h Volume', values.volume24h);

        console.log('Portfolio updated:', {
            btcPrice: `$${this.lastPrice.toLocaleString()}`,
            totalValue: `$${values.totalValue.toLocaleString()}`,
            change24h: `${values.priceChange24h >= 0 ? '+' : ''}${values.priceChange24h.toFixed(2)}%`
        });
    }

    updateStatCard(title, value, isPnL = false) {
        const statCards = document.querySelectorAll('.stat-card');
        
        statCards.forEach(card => {
            const titleElement = card.querySelector('h4');
            if (titleElement && titleElement.textContent.trim() === title) {
                const valueElement = card.querySelector('p');
                if (valueElement) {
                    if (isPnL) {
                        const isPositive = value >= 0;
                        const sign = isPositive ? '+' : '';
                        valueElement.textContent = `${sign}$${Math.abs(value).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}`;
                        valueElement.className = isPositive ? 'profit-text text-success' : 'loss-text text-danger';
                    } else {
                        valueElement.textContent = `$${value.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}`;
                    }
                }
            }
        });
    }

    startPeriodicUpdates() {
        setInterval(async () => {
            await this.fetchBitcoinPrice();
            this.updatePortfolioDisplay();
        }, this.updateInterval);
    }

    // Method to manually refresh (can be called from buttons)
    async refresh() {
        console.log('Manual refresh triggered...');
        await this.fetchBitcoinPrice();
        this.updatePortfolioDisplay();
    }

    // Method to change BTC amount (if needed)
    setBitcoinAmount(amount) {
        this.btcAmount = amount;
        this.updatePortfolioDisplay();
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.portfolioCalculator = new BitcoinPortfolioCalculator();
    
    // Add refresh functionality to existing buttons (optional)
    const refreshButtons = document.querySelectorAll('.crypto-action-btn');
    refreshButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (window.portfolioCalculator) {
                window.portfolioCalculator.refresh();
            }
        });
    });
    
    // Add visual loading indicator
    const style = document.createElement('style');
    style.textContent = `
        .updating {
            opacity: 0.7;
            transition: opacity 0.3s ease;
        }
        
        .profit-indicator.text-success {
            color: #28a745 !important;
        }
        
        .profit-indicator.text-danger {
            color: #dc3545 !important;
        }
        
        .profit-text.text-success {
            color: #28a745 !important;
        }
        
        .loss-text.text-danger {
            color: #dc3545 !important;
        }
    `;
    document.head.appendChild(style);
});

// Utility functions for manual control
window.refreshPortfolio = () => {
    if (window.portfolioCalculator) {
        window.portfolioCalculator.refresh();
    }
};

window.setBitcoinAmount = (amount) => {
    if (window.portfolioCalculator) {
        window.portfolioCalculator.setBitcoinAmount(amount);
    }
};
