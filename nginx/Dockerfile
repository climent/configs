FROM nginx:alpine

# Remove the default Nginx configuration file
RUN rm /etc/nginx/nginx.conf

# Copy our custom configuration file into the container
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 to the outside world
EXPOSE 80
