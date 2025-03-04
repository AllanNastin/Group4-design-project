# Use an official Python runtime as a parent image
FROM python:3.8-slim-buster

# Set the working directory in the container to /app
WORKDIR /app

# Add the current directory contents into the container at /app
ADD ./server.py /app
ADD ./scrap_daft.py /app
ADD ./maps.py /app
ADD ./Eircodes.json /app
ADD ./requirements.txt /app


# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Run app.py when the container launches
CMD ["python", "server.py"]