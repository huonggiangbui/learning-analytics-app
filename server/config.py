import os

class Configuration:

    # Saving flask specific env
    ENV = os.environ.get('FLASK_ENV')

    # SECRET_KEY = os.getenv('SECRET_KEY')
    # FLASK_ADDR = os.getenv('FLASK_ADDR')
    # FROM_EMAIL_ADDR = os.getenv('FROM_EMAIL_ADDR')
    # FROM_EMAIL_PASS = os.getenv('FROM_EMAIL_PASS')
    # MAIL_DOMAINS = os.getenv("MAIL_DOMAINS").split()
    # ADMIN_USERNAME=os.getenv("ADMIN_USERNAME")
    # ADMIN_PASSWORD=os.getenv("ADMIN_PASSWORD")
    FLASK_ORIGIN = os.environ.get("FLASK_ORIGIN")
    AZURE_KEY = os.environ.get("AZURE_KEY")
    
