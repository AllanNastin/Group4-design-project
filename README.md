# Group4-design-project
## Introduction 
Irish house listing open-source software that
- Can be self hosted, allowing users to maintain database and do their own analytics with the data.
- Have added filters
    - filter by commute time
    - filter by eircode
- Maintain price history
- Listing saving and user management

## Demo
- The frontend is accessible from gdp4.sprinty.tech
- Backend is accessible using gdp4back.sprinty.tech

## Deployment

### Prerequisites
For the recommended deployment (docker), make sure you have Docker installed on your server. See [official docker installation](https://docs.docker.com/engine/install/).

### Installation Steps
1. Clone the repository

2. Set up Google Map API
- [Set up Google Cloud account](https://developers.google.com/maps/documentation/javascript/cloud-setup)
- Go to [Google Maps Platform > Credentials page](https://console.cloud.google.com/project/_/google/maps-apis/credentials?utm_source=Docs_CreateAPIKey&utm_content=Docs_maps-backend)
- On the Credentials page, click Create credentials > API key.
- Copy the API key.

3. Set up `.env`
- rename [.env.example](https://github.com/AllanNastin/Group4-design-project/blob/main/backend/.env.example) to `.env`
- fill in each line as explained in the comment

4. Run Backend & Database
- run backend & database using `docker-compose up -d`

5. Run frontend
- build image with `docker build -t frontend .`
- run container with `docker run -d -p 3000:80 frontend`
