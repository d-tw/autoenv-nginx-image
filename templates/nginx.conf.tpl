user  nginx;

worker_processes  1;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

  access_log /var/log/nginx/access.log  main;

  sendfile on;
  keepalive_timeout 65;

  server {
    listen {{port}};

    server_name localhost;

    location {{autoenv_http_path}} {
        alias {{autoenv_fs_path}};
        default_type application/json;
    }

    location / {
      root /app;
      index index.html;
      try_files $uri $uri/ /index.html;
    }

    error_page   500 502 503 504  /50x.html;

    location = /50x.html {
      root   /usr/share/nginx/html;
    }

  }
}
