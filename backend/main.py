from fastapi import FastAPI, HTTPException
import sqlite3
import logging

# Initialize the app and configure logging
app = FastAPI()

logging.basicConfig(level=logging.INFO)

def get_db_connection():
    try:
        logging.info("Connecting to the database...")
        conn = sqlite3.connect('events.db')
        conn.row_factory = sqlite3.Row
        logging.info("Database connection successful.")
        return conn
    except sqlite3.Error as e:
        logging.error(f"Error connecting to database: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed.")

@app.get("/events")
def get_events():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        logging.info("Executing query to fetch events...")
        cursor.execute("SELECT * FROM events")
        events = cursor.fetchall()
        conn.close()

        result = [{"id": event["id"], "status": event["status"], "timestamp": event["timestamp"], "data": event["data"]} for event in events]
        logging.info(f"Query successful, returning {len(events)} event(s).")

        return result
    except sqlite3.Error as e:
        logging.error(f"Error fetching events: {e}")
        raise HTTPException(status_code=500, detail="Error fetching events.")
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="Unexpected server error.")
