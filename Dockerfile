FROM nginx:alpine

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

RUN apk add --no-cache bash=5.0.17-r0 python3=3.8.5-r0
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && python3 ./get-pip.py

RUN mkdir ${AUTOENV_OUTPUT_DIR}

RUN mkdir /autoenv
WORKDIR /autoenv

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ./bin ./bin
COPY ./templates ./templates

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "/autoenv/bin/healthcheck.sh" ]

ENTRYPOINT [ "/autoenv/bin/entrypoint.sh" ]
