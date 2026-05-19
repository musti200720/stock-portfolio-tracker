from flask import Flask, render_template, jsonify, request
import sqlite3
from datetime import date
import yfinance as yf
import os

app = Flask(__name__)

# ─── Auto create database on startup ────────────────
def init_db():
    conn = sqlite3.connect('stocks.db')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS stocks (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol        TEXT NOT NULL,
            quantity      INTEGER NOT NULL,
            buy_price     REAL NOT NULL,
            current_price REAL NOT NULL,
            date_added    TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()
    print('Database ready!')

init_db()

# ─── Helper: connect to database ────────────────────
def get_db():
    conn = sqlite3.connect('stocks.db')
    conn.row_factory = sqlite3.Row
    return conn

# ─── Helper: fetch live price ────────────────────────
def get_live_price(symbol):
    try:
        ticker = yf.Ticker(symbol)
        data   = ticker.history(period='1d')
        if data.empty:
            return None
        price = round(data['Close'].iloc[-1], 2)
        return price
    except:
        return None

# ─── Route 1: Home page ──────────────────────────────
@app.route('/')
def home():
    return render_template('index.html')

# ─── Route 2: Get all stocks ─────────────────────────
@app.route('/stocks')
def get_stocks():
    conn   = get_db()
    stocks = conn.execute(
        'SELECT * FROM stocks'
    ).fetchall()
    conn.close()

    stocks_list = []
    for stock in stocks:
        stocks_list.append({
            'id':            stock['id'],
            'symbol':        stock['symbol'],
            'quantity':      stock['quantity'],
            'buy_price':     stock['buy_price'],
            'current_price': stock['current_price'],
            'date_added':    stock['date_added']
        })
    return jsonify(stocks_list)

# ─── Route 3: Live price by symbol ───────────────────
@app.route('/live-price/<symbol>')
def live_price(symbol):
    price = get_live_price(symbol)
    if price is None:
        return jsonify({'error': 'Price not found'}), 404
    return jsonify({'symbol': symbol, 'price': price})

# ─── Route 4: Add a stock ────────────────────────────
@app.route('/add', methods=['POST'])
def add_stock():
    data   = request.get_json()
    symbol = data['symbol'].upper()

    # Fetch live price automatically
    price = get_live_price(symbol)
    if price is None:
        return jsonify({'error': 'Symbol not found!'}), 404

    quantity      = int(data['quantity'])
    buy_price     = price
    current_price = price
    date_added    = str(date.today())

    conn = get_db()
    conn.execute('''
        INSERT INTO stocks
        (symbol, quantity, buy_price, current_price, date_added)
        VALUES (?, ?, ?, ?, ?)
    ''', (symbol, quantity, buy_price, current_price, date_added))
    conn.commit()
    conn.close()

    return jsonify({
        'message':       'Stock added successfully!',
        'buy_price':     buy_price,
        'current_price': current_price
    })

# ─── Route 5: Refresh all live prices ────────────────
@app.route('/refresh-all', methods=['POST'])
def refresh_all():
    conn   = get_db()
    stocks = conn.execute(
        'SELECT * FROM stocks'
    ).fetchall()

    updated = 0
    for stock in stocks:
        price = get_live_price(stock['symbol'])
        if price is not None:
            conn.execute('''
                UPDATE stocks
                SET current_price = ?
                WHERE id = ?
            ''', (price, stock['id']))
            updated += 1

    conn.commit()
    conn.close()
    return jsonify({
        'message': f'{updated} stocks updated!'
    })

# ─── Route 6: Delete a stock ─────────────────────────
@app.route('/delete/<int:id>', methods=['DELETE'])
def delete_stock(id):
    conn = get_db()
    conn.execute(
        'DELETE FROM stocks WHERE id = ?', (id,)
    )
    conn.commit()
    conn.close()
    return jsonify({'message': 'Stock deleted!'})

# ─── Route 7: Update current price manually ──────────
@app.route('/update/<int:id>', methods=['PUT'])
def update_price(id):
    data          = request.get_json()
    current_price = float(data['current_price'])

    conn = get_db()
    conn.execute('''
        UPDATE stocks
        SET current_price = ?
        WHERE id = ?
    ''', (current_price, id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Price updated!'})

# ─── Run the app ─────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)