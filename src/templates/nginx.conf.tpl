user  nginx;

worker_processes  1;
error_log /dev/stderr warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format structured '{"level": "INFO", "timestamp": "$time_iso8601", "remote_addr": "$remote_addr", "message": "$request", "status": $status, "body_bytes_sent": $body_bytes_sent, "http_referer": "$http_referer", "http_user_agent": "$http_user_agent"}';

    access_log /dev/stdout structured;

    sendfile on;
    keepalive_timeout 65;

    # Expires map
    map $sent_http_content_type $expires {
        default                    off;
        text/html                  epoch;
        text/css                   max;
        application/javascript     max;
        ~image/                    max;
    }

    server {
        listen <%= port %>;

        server_name localhost;

        gzip on;
        gzip_types text/plain application/json text/css application/javascript image/svg+xml font/woff2;

        expires $expires;

        location <%= autoenvHttpPath %> {
            alias <%= autoenvFsPath %>;
            default_type application/json;
        }

        location / {
            add_header Set-Cookie "_env=<%= environment %>; Path=/; SameSite=Lax";
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
