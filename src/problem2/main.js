import './style.css'

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

class CurrencySwapApp {
  constructor() {
    this.tokens = [];
    this.prices = {};
    this.selectedFromToken = 'SWTH';
    this.selectedToToken = 'ETH';
    this.userBalances = {};
    this.recentTransactions = [];
    this.isInitialized = false;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    if (this.isInitialized) return;
    
    this.initializeElements();
    this.loadTokens();
    this.loadPrices();
    this.setupEventListeners();
    this.updateBalances();
    
    this.isInitialized = true;
    
    document.body.classList.add('app-ready');
  }

  initializeElements() {
    this.form = document.getElementById('swapForm');
    this.fromAmountInput = document.getElementById('fromAmount');
    this.toAmountInput = document.getElementById('toAmount');
    this.swapBtn = document.getElementById('swapBtn');
    
    this.fromTokenSelector = document.getElementById('fromTokenSelector');
    this.toTokenSelector = document.getElementById('toTokenSelector');
    this.fromTokenIcon = document.getElementById('fromTokenIcon');
    this.fromTokenSymbol = document.getElementById('fromTokenSymbol');
    this.toTokenIcon = document.getElementById('toTokenIcon');
    this.toTokenSymbol = document.getElementById('toTokenSymbol');
    
    this.fromBalance = document.getElementById('fromBalance');
    this.toBalance = document.getElementById('toBalance');
    
    this.fromError = document.getElementById('fromError');
    this.toError = document.getElementById('toError');
    
    this.exchangeInfo = document.getElementById('exchangeInfo');
    this.exchangeRate = document.getElementById('exchangeRate');
    this.networkFee = document.getElementById('networkFee');
    
    this.maxFromBtn = document.getElementById('maxFromBtn');
    this.swapDirectionBtn = document.getElementById('swapDirectionBtn');
    
    this.tokenModal = document.getElementById('tokenModal');
    this.successModal = document.getElementById('successModal');
    this.modalClose = document.getElementById('modalClose');
    this.successClose = document.getElementById('successClose');
    this.tokenSearch = document.getElementById('tokenSearch');
    this.tokenList = document.getElementById('tokenList');
    this.modalTitle = document.getElementById('modalTitle');
    
    this.transactionList = document.getElementById('transactionList');
    
    this.currentModalToken = null;
  }

  async loadTokens() {
    this.tokens = [
      { symbol: 'SWTH', name: 'Switcheo Token', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/SWTH.svg' },
      { symbol: 'ETH', name: 'Ethereum', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ETH.svg' },
      { symbol: 'BTC', name: 'Bitcoin', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/BTC.svg' },
      { symbol: 'USDC', name: 'USD Coin', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/USDC.svg' },
      { symbol: 'USDT', name: 'Tether', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/USDT.svg' },
      { symbol: 'SOL', name: 'Solana', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/SOL.svg' },
      { symbol: 'ADA', name: 'Cardano', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ADA.svg' },
      { symbol: 'DOT', name: 'Polkadot', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/DOT.svg' },
      { symbol: 'LINK', name: 'Chainlink', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/LINK.svg' },
      { symbol: 'UNI', name: 'Uniswap', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/UNI.svg' }
    ];
    
    this.userBalances = {
      'SWTH': 1000.0,
      'ETH': 5.0,
      'BTC': 0.1,
      'USDC': 5000.0,
      'USDT': 3000.0,
      'SOL': 50.0,
      'ADA': 2000.0,
      'DOT': 100.0,
      'LINK': 200.0,
      'UNI': 100.0
    };
  }

  async loadPrices() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://interview.switcheo.com/prices.json', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const priceData = await response.json();
      
      priceData.forEach(item => {
        if (item.currency && item.price) {
          this.prices[item.currency] = parseFloat(item.price);
        }
      });
      
      const defaultPrices = {
        'SWTH': 0.1,
        'ETH': 2000,
        'BTC': 40000,
        'USDC': 1,
        'USDT': 1,
        'SOL': 100,
        'ADA': 0.5,
        'DOT': 10,
        'LINK': 15,
        'UNI': 20
      };
      
      this.prices = { ...defaultPrices, ...this.prices };
      
      this.updateExchangeInfo();
    } catch (error) {
      console.error('Error loading prices:', error);
      this.prices = {
        'SWTH': 0.1,
        'ETH': 2000,
        'BTC': 40000,
        'USDC': 1,
        'USDT': 1,
        'SOL': 100,
        'ADA': 0.5,
        'DOT': 10,
        'LINK': 15,
        'UNI': 20
      };
    }
  }

  setupEventListeners() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSwap();
    });

    this.fromAmountInput.addEventListener('input', debounce(() => {
      this.handleFromAmountChange();
    }, 300));

    this.toAmountInput.addEventListener('input', debounce(() => {
      this.handleToAmountChange();
    }, 300));

    this.fromTokenSelector.addEventListener('click', () => {
      this.openTokenModal('from');
    });

    this.toTokenSelector.addEventListener('click', () => {
      this.openTokenModal('to');
    });

    this.maxFromBtn.addEventListener('click', () => {
      this.setMaxAmount();
    });

    this.swapDirectionBtn.addEventListener('click', () => {
      this.swapTokens();
    });

    this.modalClose.addEventListener('click', () => {
      this.closeTokenModal();
    });

    this.successClose.addEventListener('click', () => {
      this.closeSuccessModal();
    });

    this.tokenSearch.addEventListener('input', throttle(() => {
      this.filterTokens();
    }, 100));

    this.tokenModal.addEventListener('click', (e) => {
      if (e.target === this.tokenModal) {
        this.closeTokenModal();
      }
    });

    this.successModal.addEventListener('click', (e) => {
      if (e.target === this.successModal) {
        this.closeSuccessModal();
      }
    });

    this.fromAmountInput.addEventListener('focus', () => {
      document.querySelector('.token-section').classList.add('focused');
    });

    this.fromAmountInput.addEventListener('blur', () => {
      document.querySelector('.token-section').classList.remove('focused');
    });
  }

  handleFromAmountChange() {
    const amount = parseFloat(this.fromAmountInput.value) || 0;
    this.validateFromAmount(amount);
    this.convertAmount();
    this.updateSwapButton();
  }

  handleToAmountChange() {
    const amount = parseFloat(this.toAmountInput.value) || 0;
    this.validateToAmount(amount);
    this.convertAmountReverse();
    this.updateSwapButton();
  }

  validateFromAmount(amount) {
    const balance = this.userBalances[this.selectedFromToken] || 0;
    this.fromError.textContent = '';

    if (amount > balance) {
      this.fromError.textContent = 'Insufficient balance';
      return false;
    }

    if (amount < 0) {
      this.fromError.textContent = 'Amount must be positive';
      return false;
    }

    return true;
  }

  validateToAmount(amount) {
    this.toError.textContent = '';

    if (amount < 0) {
      this.toError.textContent = 'Amount must be positive';
      return false;
    }

    return true;
  }

  convertAmount() {
    const fromAmount = parseFloat(this.fromAmountInput.value) || 0;
    const fromPrice = this.prices[this.selectedFromToken] || 1;
    const toPrice = this.prices[this.selectedToToken] || 1;
    
    const fromValue = fromAmount * fromPrice;
    const toAmount = fromValue / toPrice;
    
    this.toAmountInput.value = toAmount.toFixed(6);
    this.updateExchangeInfo();
  }

  convertAmountReverse() {
    const toAmount = parseFloat(this.toAmountInput.value) || 0;
    const fromPrice = this.prices[this.selectedFromToken] || 1;
    const toPrice = this.prices[this.selectedToToken] || 1;
    
    const toValue = toAmount * toPrice;
    const fromAmount = toValue / fromPrice;
    
    this.fromAmountInput.value = fromAmount.toFixed(6);
    this.updateExchangeInfo();
  }

  updateExchangeInfo() {
    const fromPrice = this.prices[this.selectedFromToken] || 1;
    const toPrice = this.prices[this.selectedToToken] || 1;
    const rate = fromPrice / toPrice;
    
    this.exchangeRate.textContent = `1 ${this.selectedFromToken} = ${rate.toFixed(6)} ${this.selectedToToken}`;
    this.exchangeInfo.style.display = 'block';
    
    const fees = {
      'ETH': '$2.50',
      'BTC': '$5.00',
      'SWTH': '$0.50',
      'USDC': '$1.00',
      'USDT': '$1.00'
    };
    this.networkFee.textContent = fees[this.selectedFromToken] || '$1.50';
  }

  updateSwapButton() {
    const fromAmount = parseFloat(this.fromAmountInput.value) || 0;
    const toAmount = parseFloat(this.toAmountInput.value) || 0;
    const balance = this.userBalances[this.selectedFromToken] || 0;
    
    const btnText = this.swapBtn.querySelector('.btn-text');
    
    if (fromAmount === 0) {
      btnText.textContent = 'Enter an amount';
      this.swapBtn.disabled = true;
    } else if (fromAmount > balance) {
      btnText.textContent = 'Insufficient balance';
      this.swapBtn.disabled = true;
    } else if (this.selectedFromToken === this.selectedToToken) {
      btnText.textContent = 'Select different tokens';
      this.swapBtn.disabled = true;
    } else {
      btnText.textContent = `Swap ${this.selectedFromToken} for ${this.selectedToToken}`;
      this.swapBtn.disabled = false;
    }
  }

  setMaxAmount() {
    const balance = this.userBalances[this.selectedFromToken] || 0;
    this.fromAmountInput.value = balance.toFixed(6);
    this.handleFromAmountChange();
  }

  swapTokens() {
    const tempToken = this.selectedFromToken;
    const tempAmount = this.fromAmountInput.value;
    
    this.selectedFromToken = this.selectedToToken;
    this.selectedToToken = tempToken;
    
    this.updateTokenDisplay();
    this.updateBalances();
    this.convertAmount();
    this.updateSwapButton();
  }

  updateTokenDisplay() {
    const fromToken = this.tokens.find(t => t.symbol === this.selectedFromToken);
    const toToken = this.tokens.find(t => t.symbol === this.selectedToToken);
    
    if (fromToken) {
      this.fromTokenIcon.src = fromToken.icon;
      this.fromTokenSymbol.textContent = fromToken.symbol;
    }
    
    if (toToken) {
      this.toTokenIcon.src = toToken.icon;
      this.toTokenSymbol.textContent = toToken.symbol;
    }
  }

  updateBalances() {
    this.fromBalance.textContent = (this.userBalances[this.selectedFromToken] || 0).toFixed(4);
    this.toBalance.textContent = (this.userBalances[this.selectedToToken] || 0).toFixed(4);
  }

  openTokenModal(tokenType) {
    this.currentModalToken = tokenType;
    this.modalTitle.textContent = `Select ${tokenType === 'from' ? 'From' : 'To'} Token`;
    this.tokenModal.style.display = 'flex';
    this.renderTokenList();
    this.tokenSearch.focus();
  }

  closeTokenModal() {
    this.tokenModal.style.display = 'none';
    this.tokenSearch.value = '';
    this.currentModalToken = null;
  }

  renderTokenList() {
    this.tokenList.innerHTML = '';
    
    this.tokens.forEach(token => {
      const tokenItem = document.createElement('div');
      tokenItem.className = 'token-item';
      tokenItem.innerHTML = `
        <img src="${token.icon}" alt="${token.symbol}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2NjdFRUEiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0id2hpdGUiIHN0eWxlPSJtYXJnaW46IDhweCI+CjxwYXRoIGQ9Ik04IDJMMTIgNkw4IDEwTDEyIDE0TDggMThMMiAxNEw2IDEwTDIgNkw4IDJaIi8+Cjwvc3ZnPgo8L3N2Zz4K'">
        <div class="token-item-info">
          <div class="token-item-symbol">${token.symbol}</div>
          <div class="token-item-name">${token.name}</div>
        </div>
      `;
      
      tokenItem.addEventListener('click', () => {
        this.selectToken(token.symbol);
      });
      
      this.tokenList.appendChild(tokenItem);
    });
  }

  filterTokens() {
    const searchTerm = this.tokenSearch.value.toLowerCase();
    const tokenItems = this.tokenList.querySelectorAll('.token-item');
    
    tokenItems.forEach(item => {
      const symbol = item.querySelector('.token-item-symbol').textContent.toLowerCase();
      const name = item.querySelector('.token-item-name').textContent.toLowerCase();
      
      if (symbol.includes(searchTerm) || name.includes(searchTerm)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  selectToken(symbol) {
    if (this.currentModalToken === 'from') {
      this.selectedFromToken = symbol;
    } else {
      this.selectedToToken = symbol;
    }
    
    this.updateTokenDisplay();
    this.updateBalances();
    this.convertAmount();
    this.updateSwapButton();
    this.closeTokenModal();
  }

  async handleSwap() {
    const fromAmount = parseFloat(this.fromAmountInput.value);
    const toAmount = parseFloat(this.toAmountInput.value);
    
    if (!this.validateFromAmount(fromAmount)) {
      return;
    }
    
    this.swapBtn.classList.add('loading');
    const btnText = this.swapBtn.querySelector('.btn-text');
    const spinner = this.swapBtn.querySelector('.loading-spinner');
    
    btnText.textContent = '';
    spinner.style.display = 'block';
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.userBalances[this.selectedFromToken] -= fromAmount;
    this.userBalances[this.selectedToToken] += toAmount;
    
    this.addTransaction({
      from: { symbol: this.selectedFromToken, amount: fromAmount },
      to: { symbol: this.selectedToToken, amount: toAmount },
      status: 'success',
      timestamp: new Date()
    });
    
    this.fromAmountInput.value = '';
    this.toAmountInput.value = '';
    this.fromError.textContent = '';
    this.toError.textContent = '';
    this.exchangeInfo.style.display = 'none';
    
    this.swapBtn.classList.remove('loading');
    btnText.textContent = 'Enter an amount';
    spinner.style.display = 'none';
    this.swapBtn.disabled = true;
    
    this.updateBalances();
    
    this.showSuccessModal(fromAmount, toAmount);
  }

  addTransaction(transaction) {
    this.recentTransactions.unshift(transaction);
    
    if (this.recentTransactions.length > 5) {
      this.recentTransactions = this.recentTransactions.slice(0, 5);
    }
    
    this.renderTransactions();
  }

  renderTransactions() {
    this.transactionList.innerHTML = '';
    
    this.recentTransactions.forEach(tx => {
      const txItem = document.createElement('div');
      txItem.className = 'transaction-item';
      txItem.innerHTML = `
        <div>
          <div>${tx.from.amount} ${tx.from.symbol} → ${tx.to.amount} ${tx.to.symbol}</div>
          <div style="font-size: 0.8rem; color: #6b7280;">
            ${tx.timestamp.toLocaleTimeString()}
          </div>
        </div>
        <div class="status ${tx.status}">${tx.status}</div>
      `;
      
      this.transactionList.appendChild(txItem);
    });
  }

  showSuccessModal(fromAmount, toAmount) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = `Successfully swapped ${fromAmount} ${this.selectedFromToken} for ${toAmount} ${this.selectedToToken}`;
    this.successModal.style.display = 'flex';
  }

  closeSuccessModal() {
    this.successModal.style.display = 'none';
  }
}

new CurrencySwapApp(); 