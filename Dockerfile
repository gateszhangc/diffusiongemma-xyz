FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html favicon.ico favicon.svg logo.svg icon.png apple-touch-icon.png og-image.png /usr/share/nginx/html/

EXPOSE 80
