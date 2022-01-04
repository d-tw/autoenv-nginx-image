#! /bin/bash

set -e

# First, generate the env file
node /autoenv/autoenv.js > ${AUTOENV_FS_PATH}

# Then, generate the ngnix config
node /autoenv/configureNginx.js

# Now we can start nginx
/docker-entrypoint.sh nginx -g "daemon off;"
