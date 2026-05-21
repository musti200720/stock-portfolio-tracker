# 📈 Stock Portfolio Tracker

A stock portfolio tracker web application built
with Python Flask and vanilla JavaScript.
It fetches real-time stock prices from Yahoo Finance
and displays current value, profit/loss,
and portfolio summary.

---

## 🔗 Live Demo

[Stock Portfolio Tracker Live Demo](https://mustansir2007.pythonanywhere.com)

---

## ✨ Features

- Add stocks with just Symbol and Quantity
- Auto fetches live price from Yahoo Finance
- Calculates profit and loss automatically
- Green row for profit, Red row for loss
- 3 summary cards — Invested, Current Value, Overall P&L
- Refresh all live prices with one click
- Search stocks by symbol instantly
- Delete stocks from portfolio
- Date of purchase saved automatically
- Fully responsive design for mobile and desktop

---

## 🛠️ Tech Stack

- Python
- Flask
- JavaScript
- HTML
- CSS
- Bootstrap 5
- SQLite
- Yahoo Finance API (yfinance)

---

## ⚙️ Setup Instructions

1. Clone the repository
   git clone https://github.com/mustansir2007/stock-portfolio-tracker.git

2. Install required libraries
   pip install flask yfinance

3. Setup the database
   python database.py

4. Run the app
   python app.py

5. Open browser and go to
   http://localhost:5000

---

## 📁 Project Structure

stock-portfolio-tracker/
├── app.py
├── database.py
├── requirements.txt
├── templates/
│   └── index.html
└── static/
    ├── script.js
    └── style.css

---

## 💹 How to Use

- Type a stock symbol like INFY.NS or AAPL
- Enter the quantity of shares
- Click Add Stock
- Live price is fetched automatically
- Click Refresh Live Prices to update all prices
- Profit and loss updates automatically

---

## 📊 Symbol Format

| Stock | Symbol |
|---|---|
| Infosys NSE | INFY.NS |
| TCS NSE | TCS.NS |
| Reliance NSE | RELIANCE.NS |
| Apple US | AAPL |
| Tesla US | TSLA |

---

## 👨‍💻 Author

Mustansir — Information Technology Student
BSc IT — 2nd Year