FROM nginx:alpine@sha256:65645c7bb6a0661892a8b03b89d0743208a18dd2f3f17a54ef4b76fb8e2f2a10

RUN apk add --update --no-cache bash=5.2.37-r0 nodejs=22.13.1-r0

ARG PORT=8080
ARG AUTOENV_OUTPUT_DIR=/usr/share/nginx/autoenv
ARG AUTOENV_OUTPUT_FILENAME=autoenv.json
ARG AUTOENV_HTTP_PATH=/__autoenv
ARG NGINX_CONF_PATH=/etc/nginx/nginx.conf

ENV PORT=${PORT}

ENV AUTOENV_OUTPUT_DIR=${AUTOENV_OUTPUT_DIR}
ENV AUTOENV_OUTPUT_FILENAME=${AUTOENV_OUTPUT_FILENAME}
ENV AUTOENV_FS_PATH=${AUTOENV_OUTPUT_DIR}/${AUTOENV_OUTPUT_FILENAME}
ENV AUTOENV_HTTP_PATH=${AUTOENV_HTTP_PATH}
ENV NGINX_CONF_PATH=${NGINX_CONF_PATH}

ENV TEMPLATE_DIR=/autoenv/templates
RUN mkdir ${AUTOENV_OUTPUT_DIR} && mkdir /autoenv

WORKDIR /autoenv

COPY . .

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "/autoenv/healthcheck.sh" ]

ENTRYPOINT [ "/autoenv/entrypoint.sh" ]
