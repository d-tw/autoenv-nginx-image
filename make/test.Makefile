ifndef MK_TEST
MK_TEST=1

include make/image.Makefile

test: docker-build
	AUTOENV_IMAGE=$(APP_NAME):$(APP_VERSION) docker-compose -f test/docker-compose.yml up --force-recreate --remove-orphans --exit-code-from test_runner --abort-on-container-exit

endif
