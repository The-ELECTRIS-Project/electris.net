# Self-Hosting with Docker

This project supports self-hosting using Docker and `docker-compose`. It uses `@sveltejs/adapter-node` to run the SvelteKit application in a Node.js environment.

## Quick Start

1.  Ensure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.
2.  Clone the repository.
3.  Prepare your environment file:
    ```bash
    cp .env.example .env
    ```
4.  Edit `.env` to set needed API keys and configuration.
5.  Run the following command to build and start the container:

    ```bash
    docker compose up -d
    ```

The website will be available at `http://localhost:3000` by default.

## Configuration

You can configure the deployment using the `.env` file. Docker Compose is configured to load this file automatically.

### Key Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | The port the container listens on (mapped to host). | `3000` |
| `ORIGIN` | The public URL of the website (critical for CSRF protection). | `http://localhost:3000` |
| `REFERRER` | The URL fed into API requests as referrer source. | `https://electris.net` |
| `YOUTUBE_DATA_API_V3_KEY` | API Key for YouTube data integration. | (Empty) |
| `NODE_ENV` | The Node.js environment. | `production` |
| `ADAPTER` | The SvelteKit adapter to use. | `node` |

### Production Deployment

For a production deployment, you **must** set the `ORIGIN` variable to your public domain to ensure CSRF protection works correctly. If you are using YouTube API, the `REFERRER` variable must match your API key restrictions set in the Google Cloud Console.

```ini
# .env
ORIGIN=https://example.org
REFERER=https://example.org
YOUTUBE_DATA_API_V3_KEY=put_an_actual_api_key_here
```

### Behind a Reverse Proxy

If you are running the container behind a reverse proxy (like Nginx, Traefik, or Caddy), you may need to configure additional headers in `.env`:

```ini
# .env
PROTOCOL_HEADER=x-forwarded-proto
HOST_HEADER=x-forwarded-host
```

## Maintenance

### Updating the Image

To update to the latest version of the code and rebuild the image:

```bash
git pull
docker compose build
docker compose up -d
```

### Viewing Logs

```bash
docker compose logs -f
```

### Stopping the Container

```bash
docker compose down
```

## Real-Time Content Updates

By default, the `docker-compose.yml` file is configured with **bind mounts** for several subdirectories of your `static/` folder:

- `static/data/blog`
- `static/fonts`
- `static/media`

This means you can add or edit blog posts, add new fonts, or update images on your local machine, and the running container will serve them **immediately** without needing a rebuild or restart.

### Updating Blog Posts

Since the blog list is driven by a generated `index.json` blob, you can modify existing posts, but cannot add new ones without rebuilding the image to ensure the changes are reflected. The container maps your host's `static/data/blog/index.json`, which is generated when the image is built, so you *can* edit it manually, but it would be simpler to just rebuild the container image to add new blogs.

## Multi-Adapter Support

The project is configured to support both Cloudflare and Node.js deployments.
- By default, it uses `adapter-cloudflare`.
- Setting `ADAPTER=node` in the environment (as done in the `Dockerfile` and `.env`) switches it to `adapter-node`.
