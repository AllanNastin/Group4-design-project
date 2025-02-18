# Use the official MySQL image
FROM mysql:latest

# Set MySQL root password from environment variable
ARG MYSQL_ROOT_PASSWORD
ENV MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}

# Expose MySQL port
EXPOSE 3306

# Default command
CMD ["mysqld"]
