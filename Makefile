# Helpers — make build | make dev | make down | make restart | make rebuild | make delete
# Port and container name: copy env.example to .env and set PORT / CONTAINER_NAME.

IMAGE_NAME := helpers

# Load overrides from .env (copy env.example to .env)
ifneq (,$(wildcard .env))
  include .env
  export
endif
PORT ?= 3000
CONTAINER_NAME ?= tinytools-app
CONTAINER := $(CONTAINER_NAME)

.PHONY: build build-apache dev dev-apache down restart restart-apache delete

build:
	docker build -t $(IMAGE_NAME) .

build-apache:
	docker build -f Dockerfile.apache -t $(IMAGE_NAME)-apache .

dev: build
	@docker stop $(CONTAINER) 2>/dev/null || true
	@docker rm $(CONTAINER) 2>/dev/null || true
	docker run -d --name $(CONTAINER) -p $(PORT):3000 $(IMAGE_NAME)
	@echo "Helpers at http://localhost:$(PORT)"

dev-apache: build-apache
	@docker stop $(CONTAINER) 2>/dev/null || true
	@docker rm $(CONTAINER) 2>/dev/null || true
	docker run -d --name $(CONTAINER) -p $(PORT):80 $(IMAGE_NAME)-apache
	@echo "Helpers (Apache) at http://localhost:$(PORT)"

rebuild: down build
	docker run -d --name $(CONTAINER) -p $(PORT):3000 $(IMAGE_NAME)
	@echo "Helpers at http://localhost:$(PORT)"

down:
	docker stop $(CONTAINER) 2>/dev/null || true
	docker rm $(CONTAINER) 2>/dev/null || true
	@echo "Container stopped and removed."

restart: down
	docker run -d --name $(CONTAINER) -p $(PORT):3000 $(IMAGE_NAME)
	@echo "Helpers at http://localhost:$(PORT)"

restart-apache: down
	docker run -d --name $(CONTAINER) -p $(PORT):80 $(IMAGE_NAME)-apache
	@echo "Helpers (Apache) at http://localhost:$(PORT)"

delete:
	docker stop $(CONTAINER) 2>/dev/null || true
	docker rm $(CONTAINER) 2>/dev/null || true
	docker rmi $(IMAGE_NAME) $(IMAGE_NAME)-apache 2>/dev/null || true
	rm -rf frontend/dist frontend/node_modules backend/node_modules tools-manifest.json
	@echo "Container, images, and local build artifacts removed."
