#! /usr/bin/env python3

import os
import pystache

from pathlib import Path

_template_name = 'nginx.conf.tpl'


def main():
    template_path = Path(os.environ.get('TEMPLATE_DIR'), _template_name)

    with open(template_path, 'r') as template_handle:
        template = template_handle.read()

    template_args = {
        'port': os.environ.get('PORT'),
        'autoenv_http_path': os.environ.get('AUTOENV_HTTP_PATH'),
        'autoenv_fs_path': os.environ.get('AUTOENV_FS_PATH')
    }

    config_path = Path(os.environ.get('NGINX_CONF_PATH'))

    with open(config_path, 'w') as nginx_config_handle:
        nginx_config_handle.write(
            pystache.render(template, template_args)
        )


if __name__ == "__main__":
    main()
