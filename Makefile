# Helpers — make build | make dev | make down | make restart | make rebuild | make delete

IMAGE_NAME := helpers
CONTAINER  := helpers-app
PORT       := 3000

.PHONY: build dev down restart rebuild delete

build:
	docker build -t $(IMAGE_NAME) .

rebuild: down build
	docker run -d --name $(CONTAINER) -p $(PORT):3000 $(IMAGE_NAME)
	@echo "Helpers at http://localhost:$(PORT)"

dev: build
	@docker stop $(CONTAINER) 2>/dev/null || true
	@docker rm $(CONTAINER) 2>/dev/null || true
	docker run -d --name $(CONTAINER) -p $(PORT):3000 $(IMAGE_NAME)
	@echo "Helpers at http://localhost:$(PORT)"

down:
	docker stop $(CONTAINER) 2>/dev/null || true
	docker rm $(CONTAINER) 2>/dev/null || true
	@echo "Container stopped and removed."

restart: down
	docker run -d --name $(CONTAINER) -p $(PORT):3000 $(IMAGE_NAME)
	@echo "Helpers at http://localhost:$(PORT)"

delete:
	docker stop $(CONTAINER) 2>/dev/null || true
	docker rm $(CONTAINER) 2>/dev/null || true
	docker rmi $(IMAGE_NAME) 2>/dev/null || true
	rm -rf frontend/dist frontend/node_modules backend/node_modules tools-manifest.json
	@echo "Container, image, and local build artifacts removed."
