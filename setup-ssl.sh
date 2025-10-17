#!/bin/bash

# # Stop nginx tạm thời
# docker compose stop nginx

# Tạo thư mục
mkdir -p certbot/conf certbot/www

# Dùng certbot standalone (không cần nginx chạy)
docker run -it --rm \
  -p 80:80 \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly --standalone \
  -d digiz.tech \
  --email Ds.hoangdv@gmail.com \
  --agree-tos \
  --non-interactive

