# autoenv-nginx-image

autoenv-nginx is a Docker image that can be used as a base image for front-end applications.

## What problem does it solve

Server-side applications that run Docker images rely heavily on environment variables to provide runtime configuration, but front-end applications can't use this model as the code runs client-side, where the environment variables are not accessible. This often leads to creating specific front-end builds for different environments, which multiplies the number of builds and introduces unnecessary coupling between builds and configration.

This Docker image aims to solve that issue by exposing a subset of the container's environment variables in two ways:

1. **JSON Endpoint**: As a JSON document on a static HTTP path for async loading
2. **HTML Injection**: By injecting configuration directly into index.html files as a global JavaScript variable for immediate access

### Example

#### JSON Endpoint Usage

Running the docker image with the following command:

```sh
docker run --rm --name autoenv-nginx -p 80:80 -e APP_MY_VAR=foo -it ghcr.io/d-tw/autoenv-nginx:latest
```

And running the following `curl` command:

```sh
curl http://localhost/__autoenv
```

Will give you the following output:

```json
{ "APP_MY_VAR": "foo" }
```

#### HTML Injection Usage

When you place an `index.html` file in your `/app` directory, the configuration will automatically be injected as a global JavaScript variable. For example:

**Original index.html:**

```html
<!DOCTYPE html>
<html>
    <head>
        <title>My App</title>
    </head>
    <body>
        <h1>Hello World</h1>
    </body>
</html>
```

**After injection:**

```html
<!DOCTYPE html>
<html>
    <head>
        <script>
            window.__CONFIG__ = { APP_MY_VAR: 'foo' }
        </script>
        <title>My App</title>
    </head>
    <body>
        <h1>Hello World</h1>
    </body>
</html>
```

Now your JavaScript can immediately access the configuration without any network requests:

```javascript
console.log(window.__CONFIG__.APP_MY_VAR) // "foo"
```

## Usage

```sh
docker pull ghcr.io/d-tw/autoenv-nginx
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

FROM ghcr.io/d-tw/autoenv-nginx as production-stage
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

**HTML Injection**

HTML injection can be controlled with the following environment variables:

- `AUTOENV_INJECT_HTML`: Enable or disable HTML injection (default: `true`)
- `AUTOENV_GLOBAL_VAR`: Name of the global JavaScript variable (default: `window.__CONFIG__`)
- `AUTOENV_HTML_SEARCH_PATH`: Directory to search for index.html files (default: `/app`)

### Example

```sh
docker run --rm --name autoenv-nginx -p 80:1234 -e PORT=1234 -e AUTOENV_PREFIX=FOO_ -e AUTOENV_HTTP_PATH=/__foovars -e AUTOENV_GLOBAL_VAR=window.myConfig -it ghcr.io/d-tw/autoenv-nginx:latest
```
