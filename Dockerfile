FROM nginx:alpine

ARG PORT=80
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

RUN apk add bash python3
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && python3 ./get-pip.py

RUN mkdir ${AUTOENV_OUTPUT_DIR}

RUN mkdir /autoenv
WORKDIR /autoenv

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ./bin ./bin
COPY ./templates ./templates

ENTRYPOINT [ "/autoenv/bin/entrypoint.sh" ]
