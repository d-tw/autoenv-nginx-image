#! /bin/bash

set -e

# First, generate the env file
/autoenv/bin/autoenv.py > ${AUTOENV_FS_PATH}

# Then, generate the ngnix config
/autoenv/bin/configure_nginx.py

# Now we can start nginx
/docker-entrypoint.sh nginx -g "daemon off;"
