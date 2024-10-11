import sqlite3
import random
import string
import time

def generate_random_string(length=6):
    """Generate a random string of fixed length."""
    letters = string.ascii_letters
    return ''.join(random.choice(letters) for _ in range(length))

def simulate_events():
    conn = sqlite3.connect('../events.db')
    cursor = conn.cursor()
    while True:
        event_id = random.randint(1, 5)
        status = random.choice(['started', 'pending', 'completed', 'failed'])
        data = generate_random_string()
        cursor.execute("INSERT OR REPLACE INTO events (id, status, timestamp, data) VALUES (?, ?, datetime('now'), ?)", (event_id, status, data))
        conn.commit()
        print(f"Updated event {event_id} to status {status}")
        time.sleep(5)  # simulate event every 5 seconds

simulate_events()
