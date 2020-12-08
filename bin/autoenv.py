#! /usr/bin/env python3

import os
import json

_default_prefix = 'APP_'
_prefix_override = 'AUTOENV_PREFIX'


def main():
    """
    Pick the subset of environment variables whose keys start with the provided prefix.

    Prints the subset to stdout as a JSON document.
    """
    prefix = os.environ.get(_prefix_override, _default_prefix)

    picked = {k: v for k, v in os.environ.items() if k.startswith(prefix)}

    # Port is a special case, as it is typically set without a prefix but we may want to expose it
    picked['APP_PORT'] = os.environ['PORT']

    print(json.dumps(picked))


if __name__ == "__main__":
    main()
