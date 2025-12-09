# Makefile for Go project (production build)

# Binary name
BINARY = main

# Version (can override via CLI, e.g., make build VERSION=1.2.0)
VERSION ?= dev

# Go package directory (default: current directory)
PKG ?= ./cmd/gateway

# Platforms for cross-compilation
OSARCH = \
    linux/amd64 \
    linux/arm64 \
    darwin/amd64 \
    darwin/arm64 \
    windows/amd64

# Default target
.PHONY: all
all: build

# Build for local system
.PHONY: build
build:
	@echo "Building $(BINARY) for local system from package $(PKG)..."
	CGO_ENABLED=0 go build -ldflags="-s -w -X main.Version=$(VERSION)" -o $(BINARY) $(PKG)

# Build for all platforms (cross-compile)
.PHONY: build-all
build-all:
	@echo "Cross-compiling for all platforms from package $(PKG)..."
	@for osarch in $(OSARCH); do \
		OS=$${osarch%/*}; ARCH=$${osarch#*/}; \
		BIN=$(BINARY)_$${OS}_$${ARCH}; \
		if [ "$$OS" = "windows" ]; then BIN=$${BIN}.exe; fi; \
		echo "Building $$BIN for $$OS/$$ARCH..."; \
		GOOS=$$OS GOARCH=$$ARCH CGO_ENABLED=0 go build -ldflags="-s -w -X main.Version=$(VERSION)" -o $$BIN $(PKG); \
	done

# Clean built binaries
.PHONY: clean
clean:
	@echo "Cleaning binaries..."
	rm -f $(BINARY) $(BINARY)_* *.exe

# Run the binary locally
.PHONY: run
run: build
	@echo "Running $(BINARY)..."
	./$(BINARY)
