# MediaMTX — Beta VPS deployment

Self-hosted RTMP ingest + HLS playback for `chiliztv.com` beta streamers.
Runs on a Hetzner CX22 VPS, exposed via DNS `ingest.chiliztv.com`.

## Layout

| File | Role |
|---|---|
| `compose.yml` | Docker compose for the `mediamtx` container (host network mode) |
| `mediamtx.yml` | MediaMTX server config: RTMP, HLS, auth webhooks |
| `Caddyfile` | Caddy reverse proxy — HTTPS termination for HLS playback |
| `.env.example` | Template for the publish secret shared with the backend |

## Initial deploy (one-off)

Pre-reqs: VPS provisioned, UFW configured (22, 1935, 443, 9997), Docker installed, Caddy installed.

```bash
# On the VPS, as the `ops` user
sudo mkdir -p /opt/chiliztv && sudo chown ops:ops /opt/chiliztv
cd /opt/chiliztv
git clone https://github.com/<org>/chiliztv.com.git .

# MediaMTX
cd infra/mediamtx
cp .env.example .env
nano .env  # paste the publish secret (must match the backend env var)

docker compose up -d

# Caddy (HTTPS for HLS)
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## Update

```bash
cd /opt/chiliztv
git pull
cd infra/mediamtx
docker compose pull
docker compose up -d
# If Caddyfile changed:
sudo cp Caddyfile /etc/caddy/Caddyfile && sudo systemctl reload caddy
```

## Logs

```bash
cd /opt/chiliztv/infra/mediamtx
docker compose logs -f mediamtx
```

## Health checks

| What | Command |
|---|---|
| MediaMTX admin API | `curl http://localhost:9997/v3/config/global/get` |
| HLS over HTTPS (public) | `curl -I https://ingest.chiliztv.com/<streamKey>/index.m3u8` |
| Container up | `docker compose ps` |

## Secret rotation

1. Generate a new secret on the dev machine: `openssl rand -base64 32`.
2. Update the Render backend env var `MEDIAMTX_PUBLISH_SECRET`.
3. On the VPS: edit `/opt/chiliztv/infra/mediamtx/.env`, then `docker compose up -d`.
4. Active OBS streams will reconnect with the new secret on the next auth poll.
