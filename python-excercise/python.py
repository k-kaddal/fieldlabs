import time
import requests
import psycopg2

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    host='localhost',
    port='5432',
    database='your_database_name',
    user='your_username',
    password='your_password'
)
cursor = conn.cursor()

# Create the "winners" table if it doesn't exist
cursor.execute('''
    CREATE TABLE IF NOT EXISTS winners (
        id SERIAL PRIMARY KEY,
        email TEXT,
        state TEXT
    )
''')
conn.commit()

# Set to keep track of states with winners
winning_states = set()

while len(winning_states) < 25:
    # Query the API to get random users
    response = requests.get('https://random-data-api.com/api/users/random_user?size=5')
    users = response.json()

    for user in users:
        email = user['email']
        state = user['address']['state']

        if state not in winning_states:
            # Insert the new winner into the "winners" table
            cursor.execute('INSERT INTO winners (email, state) VALUES (%s, %s) ON CONFLICT (state) DO UPDATE SET email = EXCLUDED.email', (email, state))
            conn.commit()

            # Update the set of winning states
            winning_states.add(state)

            # Print log message
            print(f'New winner from {state}: {email}')

    # Wait for 10 seconds before querying the API again
    time.sleep(10)

# Print the final table
cursor.execute('SELECT * FROM winners')
table = cursor.fetchall()
for row in table:
    print(row)

# Close the database connection
cursor.close()
conn.close()
