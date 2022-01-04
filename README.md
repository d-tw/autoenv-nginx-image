# autoenv-nginx-image

![ci-badge](https://github.com/outcome-co/autoenv-nginx-image/workflows/Checks/badge.svg) ![version-badge](https://img.shields.io/badge/version-1.1.1-brightgreen)

autoenv-nginx is a Docker image that can be used as a base image for front-end applications.

## What problem does it solve

Server-side applications that run Docker images rely heavily on environment variables to provide runtime configuration, but front-end applications can't use this model as the code runs client-side, where the environment variables are not accessible. This often leads to creating specific front-end builds for different environments, which multiplies the number of builds and introduces unnecessary coupling between builds and configration.

This Docker image aims to solve that issue by exposing a subset of the container's environment variables as a JSON document on a static HTTP path, allowing the front-end application to load runtime configuration.

### Example

Running the docker image with the following command:

```sh
docker run --rm --name autoenv-nginx -p 80:80 -e APP_MY_VAR=foo -it outcomeco/autoenv-nginx:latest
```

And running the following `curl` command:

```sh
curl http://localhost/__autoenv
```

Will give you the following output:

```json
{ "APP_MY_VAR": "foo" }
```

If you run `curl` in verbose mode, you can see that the `Content-Type` is set to `application/json`.

```sh
% curl -v http://localhost/__autoenv
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to localhost (127.0.0.1) port 80 (#0)
> GET /__autoenv HTTP/1.1
> Host: localhost
> User-Agent: curl/7.64.1
> Accept: */*
>
< HTTP/1.1 200 OK
< Server: nginx/1.19.0
< Date: Tue, 02 Jun 2020 19:50:29 GMT
< Content-Type: application/json
< Content-Length: 22
< Last-Modified: Tue, 02 Jun 2020 19:50:25 GMT
< Connection: keep-alive
< ETag: "5ed6ad81-16"
< Accept-Ranges: bytes
<
{"APP_MY_VAR": "foo"}
* Connection #0 to host localhost left intact
* Closing connection 0
```

## Usage

```sh
docker pull outcomeco/autoenv-nginx
```

## Hosting front-end applications

nginx is configured to serve and `index.html` file from `/app` when requests are sent to `/`.

You can use this image as a base image in a multi-stage build process:

```Dockerfile
FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM outcomeco/autoenv-nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
```

## Configuration

**HTTP Endpoint**

By default, the HTTP path is configured to `/__autoenv`, but this can be changed by setting the `AUTOENV_HTTP_PATH` environment variable when launching the container.

**Exposed Environment Variables**

By default, all of the environment variables with the prefix `APP_` will be exposed, but this can be changed by setting the `AUTOENV_PREFIX` environment variable when launching the container.

**HTTP Port**

By default, nginx listens on port 80, but this can be changed by setting the `PORT` environment variable when launching the container.

### Example

```sh
docker run --rm --name autoenv-nginx -p 80:1234 -e PORT=1234 -e AUTOENV_PREFIX=FOO_ -e AUTOENV_HTTP_PATH=/__foovars -it outcomeco/autoenv-nginx:latest
```

## Development

Remember to run `./pre-commit.sh` when you clone the repository.
