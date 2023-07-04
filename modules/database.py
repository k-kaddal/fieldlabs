import os
import sqlite3
from modules.logger import Logger

class Database:
    def __init__(self):
        self.connection = None

        logger_instance = Logger('DATABASE')
        self.logger = logger_instance.get_logger()
        
    
    def connect(self):
        self.logger.info("Connecting Database")
        self.connection = sqlite3.connect('lotter.db')        
    
    def create_table(self):
        self.logger.info("Creating Winner Table")
        c = self.connection.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS winner
                     (
                        id SERIAL PRIMARY KEY, 
                        email TEXT,
                        state TEXT
                    )
                ''')

        self.connection.commit()


    def insert_or_update_winner(self, user_data):
        state = user_data['address']['state']
        email = user_data['email']
        username = user_data['username']

        self.logger.info("Inserting winner %s for state %s", username, state)
        c = self.connection.cursor()


        c.execute(f"SELECT id FROM winner WHERE state=?", (state,))
        existing_winner_id = c.fetchone()

        if existing_winner_id:
            c.execute(f"UPDATE winner SET email=? WHERE id=?", (email, existing_winner_id[0]))
        else:
            c.execute(f"INSERT INTO winner (email, state) VALUES (?, ?)", (email, state))
        self.connection.commit()


    def get_table(self):
        self.logger.info("Get Table")
        c = self.connection.cursor()
        c.execute(f"SELECT * FROM winner")
        return c.fetchall()


    def disconnect(self):
        self.logger.info("Disconnecting Database")
        if self.connection:
            self.connection.close()

