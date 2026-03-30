FROM nginx:alpine
RUN apk add --no-cache curl

# Копируем конфиг nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# Копируем все файлы frontend
COPY frontend/ ./

# Даем правильные права
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod 644 /usr/share/nginx/html/public/manifest.json && \
    chmod 644 /usr/share/nginx/html/public/sw.js

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]