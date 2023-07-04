import logging

class Logger:
    def __init__(self, name):
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(name)
        
        file_handler = logging.FileHandler("lottery.log")
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')        
        file_handler.setFormatter(formatter)
        
        # Add the file handler to the logger
        self.logger.addHandler(file_handler)
    
    def get_logger(self):
        return self.logger