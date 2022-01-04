#! /bin/bash

curl -f http://localhost:${PORT}/${AUTOENV_HTTP_PATH} || exit 1
