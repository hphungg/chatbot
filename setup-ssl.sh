#!/bin/bash

# Stop nginx tạm thời
docker compose stop nginx

# Tạo thư mục
mkdir -p certbot/conf certbot/www

# Dùng certbot standalone (không cần nginx chạy)
docker run -it --rm \
  -p 80:80 \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly --standalone \
  -d digiz.tech \
  -d www.digiz.tech \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# Start lại nginx với SSL đã có
docker compose up -d nginx
