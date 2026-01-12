#! /bin/sh

set -e
set -x

# Install deps
apk add curl bash

mkdir /tmp/received

# Helper fn to wait for and pull files from containers
fetch () {
    server_name=$1
    server_port=$2
    server_path=$3
    extension=${4:-json}  # Default to json if not specified

    # Wait for server to be ready
    /work/wait.sh ${server_name}:${server_port} -t 15

    # Fetch content
    /usr/bin/curl -o /tmp/received/${server_name}.${extension} http://${server_name}:${server_port}/${server_path}
}

# Retrieve configs
fetch autoenv-default 80 __autoenv
fetch autoenv-custom 80 __myvars
fetch autoenv-port-test 8080 __autoenv

# Retrieve HTML files with injected configs
fetch autoenv-html-default 80 / html
fetch autoenv-html-custom 80 / html
fetch autoenv-html-disabled 80 / html

# Test that non-index.html files also get config injected
/work/wait.sh autoenv-html-multi:80 -t 15
/usr/bin/curl -o /tmp/received/autoenv-html-multi-about.html http://autoenv-html-multi:80/about.html

# Run diff against expected outputs
echo "Testing JSON endpoints..."
json_failed=0
for expected in /work/samples/*.json; do
    filename=$(basename "$expected")
    received="/tmp/received/$filename"
    if [ -f "$received" ]; then
        if ! diff -u "$expected" "$received"; then
            echo "ERROR: JSON file $filename differs from expected!"
            json_failed=1
        fi
    else
        echo "ERROR: Missing JSON file: $filename"
        json_failed=1
    fi
done

if [ $json_failed -eq 1 ]; then
    echo "ERROR: JSON endpoint tests failed!"
    exit 1
fi
echo "JSON endpoint tests passed!"

echo "Testing HTML injection..."
html_failed=0
for expected in /work/samples/*.html; do
    filename=$(basename "$expected")
    received="/tmp/received/$filename"
    if [ -f "$received" ]; then
        if ! diff -u "$expected" "$received"; then
            echo "ERROR: HTML file $filename differs from expected!"
            html_failed=1
        fi
    else
        echo "ERROR: Missing HTML file: $filename"
        html_failed=1
    fi
done

if [ $html_failed -eq 1 ]; then
    echo "ERROR: HTML injection tests failed!"
    echo "Expected files:"
    ls -la /work/samples/*.html 2>/dev/null || echo "No expected HTML files found"
    echo "Received files:"
    ls -la /tmp/received/*.html 2>/dev/null || echo "No received HTML files found"
    exit 1
fi
echo "HTML injection tests passed!"

echo "All tests passed successfully!"
