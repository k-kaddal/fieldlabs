import requests
import time
from modules.logger import Logger

class Lottery:
    def __init__(self, database):
        self.database = database
        logger_instance = Logger('LOTTERY')
        self.logger = logger_instance.get_logger()
        

    # Function to get random clients from the API
    def get_random_clients(self):
        self.logger.info("Get 5 New Winners")

        url = "https://random-data-api.com/api/users/random_user?size=5"
        response = requests.get(url)
        if response.ok:
            return response.json()
        else:
            raise Exception(f"API request failed with status code {response.status_code}")

    def print_winners(self):
        self.logger.info("Final Winners")

        winners = self.database.get_table()
        for winner in winners:
            print(winner)


    # Starting Lottery 
    def start_lottery(self):
        self.logger.info("Start Lottery")

        winners_found = 0
        while winners_found < 25:
            try:
                # Get random clients from the API
                random_clients = self.get_random_clients()

                # Insert or update each clients as a winner in the database
                for client in random_clients:
                    self.database.insert_or_update_winner(client)

                    winners_found += 1


                # 10 seconds between API requests
                time.sleep(10)

            except Exception as e:
                print(f"Error occurred: {e}")