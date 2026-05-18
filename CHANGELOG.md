# Changelog

## 1.0.0 (2026-05-18)


### Features

* add /browse Discover page with pool stats and match cards ([90ce309](https://github.com/ChilizTV/chiliztv.com/commit/90ce309e2399da26bf34587c8624fb1acfa5d296))
* add Discover link to navbar ([6e1de89](https://github.com/ChilizTV/chiliztv.com/commit/6e1de8902fba9e987c4e6ccfb9613cfe79f9e937))
* add stream cards and redesign pool section ([cbe58b2](https://github.com/ChilizTV/chiliztv.com/commit/cbe58b2f00f4520d94a31ea84215dc409922c967))
* **ci:** discord notify on success for every deploy workflow ([159035c](https://github.com/ChilizTV/chiliztv.com/commit/159035c260873dcf803e8b00a9d08b3c77117ec0))
* **étape-6:** blockchain indexers use repositories, no use-case calls ([8296d31](https://github.com/ChilizTV/chiliztv.com/commit/8296d31395414b5816773be4d3ceecbb6bcf50d1))
* **étape-7:** create packages/blockchain — shared ABIs and chains ([18ab846](https://github.com/ChilizTV/chiliztv.com/commit/18ab846c99eb51514ae48d59cc6a10668c74603b))
* **étape-8:** WinstonLogger implements ILogger port, registered in DI ([4bdb4a6](https://github.com/ChilizTV/chiliztv.com/commit/4bdb4a6a7009880d675a5e385fd3fe6e45cb5d8e))
* **infra:** bootstrap ci/cd pipeline and split landing/app ([9a56a4b](https://github.com/ChilizTV/chiliztv.com/commit/9a56a4bd262b94444029c9c22dfacf7096ef158b))
* **infra:** bootstrap ci/cd pipeline and split landing/app ([#9](https://github.com/ChilizTV/chiliztv.com/issues/9)) ([9a56a4b](https://github.com/ChilizTV/chiliztv.com/commit/9a56a4bd262b94444029c9c22dfacf7096ef158b))
* **player:** surface MediaError code for native HLS failures ([f6bba3e](https://github.com/ChilizTV/chiliztv.com/commit/f6bba3e0781fd4427ee3215212b7e437bcb74c6c))
* redesign leaderboard to match discover page visual language ([cad22ee](https://github.com/ChilizTV/chiliztv.com/commit/cad22ee17c8372182826d55e5293939be7ce8ff6))


### Bug Fixes

* **backend:** drop body-parser in favour of express native middleware ([a468453](https://github.com/ChilizTV/chiliztv.com/commit/a468453f16447b9aa47daba109b39af6a8234e8c))
* **backend:** make REDIS_URL optional in env validation ([cd2efcb](https://github.com/ChilizTV/chiliztv.com/commit/cd2efcb0ef466ef94436751ebe2acef330b49e91))
* **backend:** map subpath exports for internal workspace packages ([47336a2](https://github.com/ChilizTV/chiliztv.com/commit/47336a2ffa33fc7e368831036ac5e8430fac64b3))
* **backend:** move viem to dependencies in blockchain package ([3a90664](https://github.com/ChilizTV/chiliztv.com/commit/3a906644a781d2545a16297367e477a76f0a8fbb))
* **backend:** resolve ts-node path aliases and matchStartTime type mismatch ([7eb1ab9](https://github.com/ChilizTV/chiliztv.com/commit/7eb1ab9b6aa6674b7390e77fa74e75c871deaa79))
* blockchain market setup — nonce management + gas limits ([1a7fec3](https://github.com/ChilizTV/chiliztv.com/commit/1a7fec3535ac9a539b3ae7f253c65e389d8ee810))
* **blockchain:** use pending nonce for all writeContract calls ([4af8abc](https://github.com/ChilizTV/chiliztv.com/commit/4af8abc5e4f3d7b3159e3db72f6e4876110cb26a))
* **caddy:** let MediaMTX own the CORS headers (avoid double-header conflict) ([9b96287](https://github.com/ChilizTV/chiliztv.com/commit/9b9628794c74218ad0ab1802c04020b7512d1046))
* **caddy:** reflect Origin + strip upstream CORS to support credentials ([26a68e6](https://github.com/ChilizTV/chiliztv.com/commit/26a68e6f015c19831b44061f8ea33bd8c77e3d47))
* **caddy:** respond 200 to Safari cookieCheck probe (avoid 301 redirect loop) ([9498f3c](https://github.com/ChilizTV/chiliztv.com/commit/9498f3c4474359f5ad35c0e389b06d69c3830484))
* **caddy:** strip Safari's cookieCheck=1 probe before forwarding to mediamtx ([3fd0876](https://github.com/ChilizTV/chiliztv.com/commit/3fd08768671bfbf84207f840af271f46ff01325b))
* **chat:** send uppercase MessageType values in all Supabase inserts ([fcca951](https://github.com/ChilizTV/chiliztv.com/commit/fcca951347467e3cd603e95a53d6c9092d31bc2e))
* **ci:** align vercel build target with staging pull ([63b1713](https://github.com/ChilizTV/chiliztv.com/commit/63b17130ae360dfc1c917159d3eff6d308d85641))
* **ci:** bootstrap initial schema before integration migrations ([d02d4ce](https://github.com/ChilizTV/chiliztv.com/commit/d02d4ce1b2d0837c4b00560cb9cad1284f52a635))
* **ci:** bypass vercel deployment protection on staging smoke ([1922c7c](https://github.com/ChilizTV/chiliztv.com/commit/1922c7c9fe0189e68b00aadad19e05402be34c8a))
* **ci:** harden fly smoke checks and unblock supabase integration tests ([c0b53fd](https://github.com/ChilizTV/chiliztv.com/commit/c0b53fd121631a2b6ccac1a1802809e5fdc8ebb6))
* **ci:** point app deploys to vercel staging environment ([fa4402a](https://github.com/ChilizTV/chiliztv.com/commit/fa4402a0714a01ddc3c857afc6905b3105ad9de4))
* **ci:** release-please input cleanup and supabase env export ([841590e](https://github.com/ChilizTV/chiliztv.com/commit/841590e9bdb3957438c9777391e7d3c06aa49e6f))
* **ci:** repair staging deploy chain after first main push ([1dbeed5](https://github.com/ChilizTV/chiliztv.com/commit/1dbeed5d3220e2dbe573b21a02b5447c0b75a883))
* **ci:** split landing staging and prod into two cf pages projects ([ed4c006](https://github.com/ChilizTV/chiliztv.com/commit/ed4c0061846ad2c89a29fca1370657e02298ccfc))
* **deploy:** force build ([dce69d8](https://github.com/ChilizTV/chiliztv.com/commit/dce69d8395aad2dff358fac742b8683beb5062f2))
* **frontend:** align [@dynamic-labs](https://github.com/dynamic-labs) packages to 4.73.2 ([63b50cf](https://github.com/ChilizTV/chiliztv.com/commit/63b50cfb82c2143a33af9be3b8e06e3197b89835))
* **frontend:** exempt /api/health from access-code middleware ([0515340](https://github.com/ChilizTV/chiliztv.com/commit/0515340eec264e24eb161cd17fc4547d265e6068))
* **mediamtx:** align HLS config with local dev (LL-HLS fmp4 parts) ([5e1fb86](https://github.com/ChilizTV/chiliztv.com/commit/5e1fb868c094e930492abd7a50e62f874c91b8b9))
* **mediamtx:** drop LL-HLS parts (iOS rejects variable part durations) ([b79c636](https://github.com/ChilizTV/chiliztv.com/commit/b79c636d79f78c59eb2aac203ead0b1cb8c5a50d))
* **mediamtx:** mpegts variant for iOS Safari compat (fmp4 → MEDIA_ERR_SRC_NOT_SUPPORTED) ([2294be0](https://github.com/ChilizTV/chiliztv.com/commit/2294be0a6ee8b83d5e0ffd2aee238dd122ad9023))
* **mediamtx:** revert to latest-ffmpeg (v1.16-ffmpeg tag does not exist) ([3d847ec](https://github.com/ChilizTV/chiliztv.com/commit/3d847ec218a014ded331ea83ea9c97a73a817425))
* **mediamtx:** use mpegts variant for max OBS compatibility ([ab48456](https://github.com/ChilizTV/chiliztv.com/commit/ab48456c10f5a517e02d1c8e9de1c3c2ba15b317))
* **player:** probe HLS playlist with GET (MediaMTX 404s on HEAD) ([9677cdc](https://github.com/ChilizTV/chiliztv.com/commit/9677cdc174815bde2757934d732d708ef5b38c7b))
* **stream:** WHIP CORS via MediaMTX (no Caddy double-header) + enable webrtc ([8ec4644](https://github.com/ChilizTV/chiliztv.com/commit/8ec46447cffe46857b2845522fd917a4e5e6b0af))
* system messages in stream chat ([75c9ccd](https://github.com/ChilizTV/chiliztv.com/commit/75c9ccdaa3271edc0ea2a3eed0c85caf45634c73))

## Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- release-please-start-version -->
<!-- release-please-end-version -->
