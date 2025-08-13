// --- Live Market Price Fetch from CoinGecko ---
function fetchLiveMarketPrices() {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana&vs_currencies=usd&include_24hr_change=true")
        .then(res => res.json())
        .then(data => {
            const prices = {
                'btc-price': `$${data.bitcoin.usd.toLocaleString()}`,
                'eth-price': `$${data.ethereum.usd.toLocaleString()}`,
                'bnb-price': `$${data.binancecoin.usd.toLocaleString()}`,
                'sol-price': `$${data.solana.usd.toLocaleString()}`
            };
            Object.keys(prices).forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = prices[id];
            });
        })
        .catch(error => {
            console.error("Failed to fetch live prices:", error);
        });
}

// --- Copy Bitcoin address to clipboard ---
function copyAddress() {
    const addressInput = document.getElementById('btc-address');
    const copyBtn = document.getElementById('copy-btn');
    const copyFeedback = document.getElementById('copy-feedback');
    
    // Select and copy the address
    addressInput.select();
    addressInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        
        // Update button appearance
        copyBtn.innerHTML = '<i class="fas fa-check"></i> <span class="copy-text">Copied!</span>';
        copyBtn.style.background = 'linear-gradient(135deg, #4caf50, #388e3c)';
        
        // Show feedback message
        copyFeedback.classList.add('show');
        
        // Reset after 3 seconds
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> <span class="copy-text">Copy</span>';
            copyBtn.style.background = 'linear-gradient(135deg, #4fc3f7, #29b6f6)';
            copyFeedback.classList.remove('show');
        }, 3000);
        
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

// --- Enhanced Check Bitcoin Payment to Address ---
function checkPayment() {
    const address = document.getElementById("btc-address").value.trim();
    const MIN_USD = 1000;
    const statusDiv = document.getElementById("payment-status");
    
    // Show loading state
    statusDiv.className = "payment-status loading";
    statusDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-spinner" style="animation: spin 1s linear infinite;"></i>
            <span>Checking payment status...</span>
        </div>
    `;

    fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${address}`)
        .then(res => res.json())
        .then(data => {
            const totalReceivedBTC = data.total_received / 1e8;

            return fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
                .then(res => res.json())
                .then(priceData => {
                    const btcToUsd = priceData.bitcoin.usd;
                    const totalUsd = totalReceivedBTC * btcToUsd;

                    if (totalUsd >= MIN_USD) {
                        statusDiv.className = "payment-status success";
                        statusDiv.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-check-circle"></i>
                                <div>
                                    <div style="font-size: 16px; margin-bottom: 5px;">✅ Payment Confirmed!</div>
                                    <div style="font-size: 14px; opacity: 0.8;">${totalUsd.toFixed(2)} received. Account activated!</div>
                                </div>
                            </div>
                        `;
                    } else {
                        statusDiv.className = "payment-status error";
                        statusDiv.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-exclamation-circle"></i>
                                <div>
                                    <div style="font-size: 16px; margin-bottom: 5px;">❌ Insufficient Payment</div>
                                    <div style="font-size: 14px; opacity: 0.8;">Only ${totalUsd.toFixed(2)} received. Please send at least ${MIN_USD} worth of BTC.</div>
                                </div>
                            </div>
                        `;
                    }
                });
        })
        .catch(err => {
            statusDiv.className = "payment-status error";
            statusDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-times-circle"></i>
                    <div>
                        <div style="font-size: 16px; margin-bottom: 5px;">Connection Error</div>
                        <div style="font-size: 14px; opacity: 0.8;">Unable to check payment status. Please try again later.</div>
                    </div>
                </div>
            `;
            console.error("Payment check failed:", err);
        });
}

// --- Button Action Handling ---
function setupButtonActions() {
    // Handle withdraw buttons specifically
    document.querySelectorAll('[data-toggle="modal"][data-target="#withdrawModal"]').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => this.style.transform = 'scale(1)', 150);
            
            // Show modal with slight delay to ensure DOM is ready
            setTimeout(() => {
                $('#withdrawModal').modal('show');
            }, 100);
        });
    });

    // Handle other buttons (non-withdraw) - EXCLUDE LOGOUT BUTTONS
    document.querySelectorAll('.crypto-btn:not([data-toggle="modal"]):not([type="submit"]), .crypto-action-btn:not([data-toggle="modal"]):not([type="submit"])').forEach(btn => {
        // Skip logout buttons entirely
        const form = btn.closest('form');
        if (form && form.action && form.action.includes('logout')) {
            return; // Skip logout buttons
        }
        
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            const action = this.textContent.trim();

            this.style.transform = 'scale(0.95)';
            setTimeout(() => this.style.transform = 'scale(1)', 150);

            if (action.includes('Deposit')) {
                alert('Activate your account to be able to Deposit funds');
            } else if (action.includes('Buy') || action.includes('Sell')) {
                alert(`Activate your account to use the ${action} feature`);
            } else if (action.includes('Trade')) {
                alert('Activate your account to use the Trade feature');
            } else if (action.includes('Convert')) {
                alert('Activate your account to use the Convert feature');
            }
        });
    });
}

// --- Hover Effects ---
function setupRowHover() {
    document.querySelectorAll('.crypto-table tbody tr').forEach(row => {
        row.addEventListener('mouseenter', () => row.style.backgroundColor = '#2a2a2a');
        row.addEventListener('mouseleave', () => row.style.backgroundColor = 'transparent');
    });
}

// --- Smooth Button Transitions ---
function setupButtonAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        .crypto-btn, .crypto-action-btn {
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .crypto-btn:hover, .crypto-action-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .crypto-btn:active, .crypto-action-btn:active {
            transform: scale(0.95);
        }
        
        /* Ensure modal stays visible */
        .modal.fade.show {
            display: block !important;
        }
        
        .modal-backdrop {
            z-index: 1040;
        }
        
        .modal {
            z-index: 1050;
        }
    `;
    document.head.appendChild(style);
}

// --- Modal Event Handling ---
function setupModalHandling() {
    // Ensure modal events are properly handled
    $('#withdrawModal').on('show.bs.modal', function (e) {
        console.log('Modal is about to show');
    });
    
    $('#withdrawModal').on('shown.bs.modal', function (e) {
        console.log('Modal is now visible');
    });
    
    $('#withdrawModal').on('hide.bs.modal', function (e) {
        console.log('Modal is about to hide');
    });
}

// --- Logout Fix ---
function setupLogoutFix() {
    // Find the logout button
    const logoutBtn = document.querySelector('button[type="submit"]:has(i.fa-sign-out)');
    
    if (logoutBtn) {
        // Remove any existing event listeners that might interfere
        logoutBtn.onclick = null;
        
        // Add proper logout handling
        logoutBtn.addEventListener('click', function(e) {
            // Don't prevent default - let the form submit naturally
            console.log('Logout button clicked - submitting form');
            
            // Optional: Add visual feedback
            this.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Logging out...';
            this.disabled = true;
            
            // Let the form submit normally (don't prevent default)
            return true;
        });
    }
}

// --- Initialize Everything ---
document.addEventListener('DOMContentLoaded', () => {
    const initializeWhenReady = () => {
        if (typeof $ !== 'undefined' && typeof $.fn.modal !== 'undefined') {
            fetchLiveMarketPrices();
            setupButtonActions(); // This now ignores logout buttons
            setupRowHover();
            setupButtonAnimations();
            setupModalHandling();
            // DON'T add any logout handling functions
            console.log('Dashboard initialized successfully');
        } else {
            setTimeout(initializeWhenReady, 100);
        }
    };
    
    initializeWhenReady();
});

// --- Auto-refresh Prices Every 30 Seconds ---
setInterval(fetchLiveMarketPrices, 30000);
