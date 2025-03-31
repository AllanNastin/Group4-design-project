# Use an official Python runtime as a parent image
FROM python:3.8-slim-buster

# Set the working directory in the container to /app
WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libffi-dev
    
ADD ./requirements.txt /app
RUN pip install -r requirements.txt
# Add the current directory contents into the container at /app
ADD ./Eircodes.json /app
ADD ./Sample.json /app
ADD ./server.py /app
ADD ./scrap_daft.py /app
ADD ./maps.py /app


# Install any needed packages specified in requirements.txt

# Run app.py when the container launches
CMD ["python", "server.py"]