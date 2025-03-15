from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
import sqlite3

app = FastAPI()

# Database setup
DB_FILE = "dispensing_times.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS dispensing_times (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()  # Initialize DB on startup

class DispensingTime(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    second: int

@app.post("/set_time")
def set_time(data: DispensingTime):
    """ Store a new dispensing time in the database. """
    timestamp = datetime(data.year, data.month, data.day, data.hour, data.minute, data.second).isoformat()
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO dispensing_times (timestamp) VALUES (?)", (timestamp,))
    conn.commit()
    conn.close()
    return {"message": "Dispensing time set", "timestamp": timestamp}

@app.get("/get_time")
def get_time():
    """ Retrieve the nearest upcoming dispensing time. """
    current_time = datetime.utcnow().isoformat()  # Use UTC time for consistency
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp FROM dispensing_times WHERE timestamp > ? ORDER BY timestamp ASC LIMIT 1", (current_time,))
    result = cursor.fetchone()
    conn.close()

    if result:
        return {"next_dispensing_time": result[0]}
    else:
        return {"message": "No upcoming dispensing times"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)