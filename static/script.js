// ── Show today's date in navbar ──────────────────────
window.onload = function() {
    var today   = new Date();
    var options = {
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric'
    };
    document.getElementById('todays-date').innerText
        = today.toLocaleDateString('en-IN', options);
    loadStocks();
}

// ── Store stocks globally for search ─────────────────
var allStocks = [];

// ── Fetch all stocks from Python ─────────────────────
function loadStocks() {
    fetch('/stocks')
    .then(function(r) { return r.json(); })
    .then(function(stocks) {
        allStocks = stocks;
        displayStocks(stocks);
    });
}

// ── Display stocks in table ───────────────────────────
function displayStocks(stocks) {
    var tbody         = document.getElementById('stock-table-body');
    tbody.innerHTML   = '';
    var totalInvested = 0;
    var totalCurrent  = 0;

    if (stocks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-msg">
                No stocks added yet.
                Add your first stock above!
                </td>
            </tr>`;
        updateSummary(0, 0);
        return;
    }

    stocks.forEach(function(stock, index) {
        var invested   = stock.buy_price     * stock.quantity;
        var current    = stock.current_price * stock.quantity;
        var profitLoss = current - invested;
        var color      = profitLoss >= 0 ? 'text-success' : 'text-danger';
        var rowColor   = profitLoss >= 0 ? 'profit-row'   : 'loss-row';
        var sign       = profitLoss >= 0 ? '+'            : '';

        totalInvested += invested;
        totalCurrent  += current;

        tbody.innerHTML += `
            <tr class="${rowColor}">
                <td>${index + 1}</td>
                <td><strong>${stock.symbol}</strong></td>
                <td>${stock.quantity}</td>
                <td>₹${stock.buy_price.toFixed(2)}</td>
                <td>
                    ₹${stock.current_price.toFixed(2)}
                    <span class="badge bg-success ms-1">
                    LIVE</span>
                </td>
                <td class="${color}">
                    ${sign}₹${profitLoss.toFixed(2)}
                </td>
                <td>${stock.date_added}</td>
                <td>
                    <button
                    class="btn btn-danger btn-sm"
                    onclick="deleteStock(${stock.id})">
                    🗑️ Delete
                    </button>
                </td>
            </tr>`;
    });

    updateSummary(totalInvested, totalCurrent);
}

// ── Update summary cards ──────────────────────────────
function updateSummary(invested, current) {
    var pl      = current - invested;
    var plColor = pl >= 0 ? 'profit-color' : 'loss-color';
    var sign    = pl >= 0 ? '+' : '';

    document.getElementById('total-invested').innerText
        = '₹' + invested.toFixed(2);
    document.getElementById('total-value').innerText
        = '₹' + current.toFixed(2);

    var plEl       = document.getElementById('overall-pl');
    plEl.innerText = sign + '₹' + pl.toFixed(2);
    plEl.className = 'summary-value ' + plColor;
}

// ── Show status message ───────────────────────────────
function showStatus(msg, type) {
    var el       = document.getElementById('status-msg');
    el.innerHTML = `
        <div class="alert alert-${type}">
        ${msg}
        </div>`;
    setTimeout(function() { el.innerHTML = ''; }, 3000);
}

// ── Add new stock (only symbol + quantity needed) ─────
function addStock() {
    var symbol   = document.getElementById('symbol').value.trim();
    var quantity = document.getElementById('quantity').value;

    // Validation
    if (!symbol || !quantity) {
        alert('⚠️ Please enter Symbol and Quantity!');
        return;
    }
    if (quantity <= 0) {
        alert('⚠️ Quantity must be greater than zero!');
        return;
    }

    showStatus('⏳ Fetching live price for '
               + symbol + '... please wait', 'info');

    fetch('/add', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            symbol:   symbol,
            quantity: quantity
        })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) {
            showStatus('❌ Symbol not found! '
                       + 'Try INFY.NS or AAPL', 'danger');
            return;
        }
        document.getElementById('symbol').value   = '';
        document.getElementById('quantity').value = '';
        showStatus(
            '✅ ' + symbol + ' added! '
            + 'Buy Price = ₹' + data.buy_price,
            'success'
        );
        loadStocks();
    });
}

// ── Refresh all live prices ───────────────────────────
function refreshPrices() {
    showStatus('⏳ Refreshing all live prices...', 'info');
    fetch('/refresh-all', { method: 'POST' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        showStatus('✅ ' + data.message, 'success');
        loadStocks();
    });
}

// ── Search stocks by symbol ───────────────────────────
function searchStock() {
    var query    = document.getElementById('search')
                   .value.toUpperCase();
    var filtered = allStocks.filter(function(stock) {
        return stock.symbol.includes(query);
    });
    displayStocks(filtered);
}

// ── Delete a stock ────────────────────────────────────
function deleteStock(id) {
    if (!confirm('🗑️ Sure you want to delete this stock?'))
        return;
    fetch('/delete/' + id, { method: 'DELETE' })
    .then(function(r) { return r.json(); })
    .then(function() { loadStocks(); });
}