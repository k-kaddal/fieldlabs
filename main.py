from modules.database import Database
from modules.lottery import Lottery

def main():
    
    # Create Database and Winner Table
    database = Database()

    database.connect()
    database.create_table()
    
    # Start Lottery
    lottery = Lottery(database)
    lottery.start_lottery()
    lottery.print_winners()
    
    # Disconnect Database
    database.disconnect()

if __name__ == "__main__":
    main()