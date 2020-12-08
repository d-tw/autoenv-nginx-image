#! /bin/sh

set -e
set -x

# Install deps
apk add curl bash

mkdir /tmp/received

# Helper fn to wait for and pull the JSON file
fetch () {
    server_name=$1
    server_port=$2
    server_path=$3

    # Wait for server to be ready
    /work/wait.sh ${server_name}:${server_port} -t 15

    # Fetch autoenv
    /usr/bin/curl -o /tmp/received/${server_name}.json http://${server_name}:${server_port}/${server_path}
}

# Retrieve configs
fetch autoenv-default 80 __autoenv
fetch autoenv-custom 80 __myvars
fetch autoenv-port-test 8080 __autoenv

# Run diff against expected outputs
diff -rN /work/samples/ /tmp/received/
