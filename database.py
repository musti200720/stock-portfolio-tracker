import sqlite3

def create_database():
    conn = sqlite3.connect('stocks.db')
    cursor = conn.cursor()

    cursor.execute('''
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
    print('Database and table created successfully!')

create_database()