# Group4-design-project
## Introduction 
Irish house listing open-source software that:
- Can be self hosted, allowing users to maintain database and do their own analytics with the data.
- Have added filters
    - filter by rent or buy
    - filter by location
    - filter by price
    - filter by number of bedrooms
    - filter by number of bathrooms
    - filter by size
- Maintain price history
- Listing saving and user management

## Demo
- The frontend is accessible from [gdp4.sprinty.tech](gdp4.sprinty.tech)
- Backend is accessible using [gdp4back.sprinty.tech](gdp4back.sprinty.tech)

## Deployment

### Prerequisites
For the recommended deployment (docker), make sure you have Docker installed on your server. See [official docker installation](https://docs.docker.com/engine/install/).

### Installation Steps
1. Clone the repository

2. Set up Google Maps API
- [Set up Google Cloud account](https://developers.google.com/maps/documentation/javascript/cloud-setup)
- Go to [Google Maps Platform > Credentials page](https://console.cloud.google.com/project/_/google/maps-apis/credentials?utm_source=Docs_CreateAPIKey&utm_content=Docs_maps-backend)
- On the Credentials page, click Create credentials > API key.
- Copy the API key.

3. Set up `.env`
- rename [.env.example](https://github.com/AllanNastin/Group4-design-project/blob/main/backend/.env.example) to `.env`
- fill in each line as explained in the comments

4. Run Backend & Database
- navigate to backend directory `cd backend`
- run backend & database using `docker-compose up --build`

5. Run frontend

- npm
  - from root directory, navigate to frontend directory `cd frontend`
  - install dependencies using `npm i`
  - run frontend using `npm start`
  - this should open a new tab in your browser with the frontend running on `localhost:3000`
  - in `frontend\.env` the server url is set to `http://localhost:5300` by default, if you are running the backend on a different port, make sure to change this in the frontend `frontend\.env` file.

- Docker
  - from root directory, navigate to frontend directory `cd frontend`
  - build the frontend image using `docker build -t frontend .`
  - run the frontend image using `docker run -p 3000:3000 frontend`