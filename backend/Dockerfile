# Use an official Python runtime as a parent image
FROM python:3.8-slim-buster

# Set the working directory in the container to /app
WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libffi-dev

# Add the current directory contents into the container at /app
ADD ./server.py /app
ADD ./requirements.txt /app
ADD ./Sample.json /app
ADD ./scrap_daft.py /app

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Run app.py when the container launches
CMD ["python", "server.py"]