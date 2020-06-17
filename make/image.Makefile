ifndef MK_IMAGE
MK_IMAGE=1


# VARIABLES

APP_NAME = autoenv-nginx
APP_VERSION = $(shell cat VERSION)

ifndef APP_PORT
APP_PORT = 8080
endif

DOCKER_NAMESPACE = outcomeco
DOCKER_REGISTRY = $(DOCKER_NAMESPACE)/$(APP_NAME)

# DOCKER

.PHONY: docker-build docker-run docker-stop docker-clean docker-info docker-console docker-login docker-push

docker-build: ## Build the docker image
	docker build --build-arg PORT=$(APP_PORT) -t $(APP_NAME):$(APP_VERSION) .
	docker tag $(APP_NAME):$(APP_VERSION) $(APP_NAME):latest

docker-run: docker-build ## Build and run the docker container
	docker run --rm --name $(APP_NAME) -p $(APP_PORT):$(APP_PORT) -it $(APP_NAME):latest

docker-console: docker-build ## Run a bash console in the docker container
	docker run --rm --name $(APP_NAME) -p $(APP_PORT):$(APP_PORT) -it --entrypoint /bin/bash $(APP_NAME):latest

docker-stop: ## Stop the docker container
	docker stop $(APP_NAME)

docker-clean: ## Delete the docker image
	docker image rm $(APP_NAME)

docker-push: docker-build docker-login ## Push the docker image to the registry
	docker tag $(APP_NAME):$(APP_VERSION) $(DOCKER_REGISTRY):latest
	docker tag $(APP_NAME):$(APP_VERSION) $(DOCKER_REGISTRY):$(APP_VERSION)
	docker push $(DOCKER_REGISTRY):$(APP_VERSION)
	docker push $(DOCKER_REGISTRY):latest

docker-login: ## Log in to the docker registry
	gcloud auth configure-docker

# We use $(info) instead of @echo to avoid passing the variables to the shell
# as they can contain special chars like '>' that redirect the output
# We need the trailing comment else make complains that there's 'nothing to do'
# in the target
docker-info:
	$(info ::set-output name=docker_registry::$(DOCKER_REGISTRY))
	$(info ::set-output name=docker_tag::$(APP_VERSION))
	$(info ::set-output name=docker_build_args::PORT=$(APP_PORT))
	@#

endif
