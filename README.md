# README

# Setting up the project locally

1. First step is to clone the project, and go to the root folder
    
    ```powershell
    git clone https://github.com/huonggiangbui/learning-analytics-app
    cd learning-analytics-app
    ```
    
2. You need a virtual environment to work with the server (which is written in Python). You can either use (1) [Miniconda](https://docs.conda.io/en/latest/miniconda.html) or (2) [venv](https://docs.python.org/3/library/venv.html). Once you have virtual environment installed, create a new virtual environment for this project and activate them. My scripts using miniconda looks like this:
    
    ```powershell
    conda create –name quercus-dev
    conda activate quercus-dev
    ```
    
3. The next step is to install dependencies. You need to install dependencies for client app (using React) and server (using Python Flask) separately. My scripts looks like this using npm and pip3 as package managers (assuming that you are in the root folder):
    - For client
        
        ```powershell
        cd client
        npm install
        ```
        
    - For server
        
        ```powershell
        cd server
        pip3 install -r requirements.txt
        ```
        
    
    Note that if there are any missing packages for the server, please install them manually using pip3 or any package manager that you want to use
    
4. You need environment variables to run the project properly:
    - For client: Create a `.env` file in the client folder with the content like this:
        
        ```powershell
        REACT_APP_API_URL = http://127.0.0.1:5000/api
        REACT_APP_VISUALIZATION_PREFIX = https://quercus.blob.core.windows.net/visualizations/
        ```
        
        Note that here I create a `visualizations` container in Azure Storage Account `quercus` to store all the figures in the app. If you want to store it elsewhere, make sure to update the link. This prefix will be used with the filepath to render the figures in client app.
        
    - For server: Create a `.flaskenv` file in the server folder with the content like this:
        
        ```powershell
        FLASK_APP=base.py
        FLASK_DEBUG=True
        FLASK_ORIGIN=http://localhost:3000
        AZURE_KEY=
        ```
        
        You need to create a storage account in Azure, and then get the access key and paste it here. You can read more [here](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal).
        
5. Now you are good to go! You will also need to run the client app and server separately too:
    - For client (assuming that you are in `client` folder):
        
        ```powershell
        npm start
        ```
        
    - For server (assuming that you are in `server` folder):
        
        ```powershell
        flask run
        ```