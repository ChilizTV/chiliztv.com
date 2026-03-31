# chiliztv.com

Source-code for chiliztv.com

## Requirements

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Development

### Start the Docker Compose services

```bash
docker compose up -d
```

### Install the Node dependencies

```bash
docker compose exec node npm i
```

### Start the backend

```bash
docker compose exec node npm -w applications/backend run dev
```

### Start the frontend

```bash
docker compose exec node npm -w applications/frontend run dev
```

### Stop the Docker Compose services

```bash
docker compose down --remove-orphans --volumes --timeout 0
```

## Build

```bash
docker compose -f compose/build.yaml build
docker compose -f compose/build.yaml up
docker compose -f compose/build.yaml down --remove-orphans --volumes --timeout 0
```

## Deploy

```bash
docker -c chiliztv.com compose -f compose/deploy.yaml up -d --build
docker -c chiliztv.com compose -f compose/deploy.yaml compose down --remove-orphans --volumes --timeout 0
```
