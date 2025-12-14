# Makefile for Go project (production build)

BINARY = main

VERSION ?= dev

PKG ?= ./cmd/gateway

OSARCH = \
    linux/amd64 \
    linux/arm64 \
    darwin/amd64 \
    darwin/arm64 \
    windows/amd64

WEB_DIR = webapp

.PHONY: all
all: build-web build

.PHONY: build-web
build-web:
	@echo "Building webapp..."
	cd $(WEB_DIR) && pnpm install && pnpm build

.PHONY: build
build: build-web
	@echo "Building $(BINARY) for local system from package $(PKG)..."
	CGO_ENABLED=0 go build -ldflags="-s -w -X main.Version=$(VERSION)" -o $(BINARY) $(PKG)

.PHONY: build-all
build-all: build-web
	@echo "Cross-compiling for all platforms from package $(PKG)..."
	@for osarch in $(OSARCH); do \
		OS=$${osarch%/*}; ARCH=$${osarch#*/}; \
		BIN=$(BINARY)_$${OS}_$${ARCH}; \
		if [ "$$OS" = "windows" ]; then BIN=$${BIN}.exe; fi; \
		echo "Building $$BIN for $$OS/$$ARCH..."; \
		GOOS=$$OS GOARCH=$$ARCH CGO_ENABLED=0 go build -ldflags="-s -w -X main.Version=$(VERSION)" -o $$BIN $(PKG); \
	done

.PHONY: clean
clean:
	@echo "Cleaning binaries..."
	rm -f $(BINARY) $(BINARY)_* *.exe
	@echo "Cleaning webapp dist..."
	rm -rf internal/embedf/dist

.PHONY: run
run: build
	@echo "Running $(BINARY)..."
	./$(BINARY)
