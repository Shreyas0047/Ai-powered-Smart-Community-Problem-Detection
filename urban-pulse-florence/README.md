# Urban Pulse Florence Vision Service

Independent Florence-2 visual-perception service for Urban Pulse AI. It accepts a sanitized incident image and returns structured observations. It does **not** receive user identity or complaint context and cannot decide category, severity, ward, department, routing, acceptance, or escalation.

## API contract

- `GET /health`: process and model-load status.
- `GET /ready`: `200` only after Florence is loaded; otherwise `503`.
- `POST /v1/analyze`: multipart upload with the `image` field.
- Authentication: `X-Urban-Pulse-Vision-Token` must match `FLORENCE_SERVICE_TOKEN`.
- Response schema: version `1.0`, containing scene description, visible issues and evidence, hazards, infrastructure damage, environmental conditions, image quality, uncertainty, and human-review recommendation.

The service never logs image bytes, authentication tokens, or user information.

## Local verification

```bash
python -m venv .venv
source .venv/bin/activate
pip install --extra-index-url https://download.pytorch.org/whl/cpu torch==2.4.1+cpu torchvision==0.19.1+cpu
pip install -r requirements-test.txt
FLORENCE_WARMUP=false FLORENCE_SERVICE_TOKEN=test-service-token python -m unittest discover -s tests -v
docker build -t urban-pulse-florence .
docker run --rm -p 8080:8080 -e FLORENCE_SERVICE_TOKEN="$(openssl rand -hex 32)" urban-pulse-florence
```

## AWS EC2 deployment

The current deployment profile is:

- Region: Asia Pacific (Mumbai), `ap-south-1`
- Operating system: Ubuntu Server 24.04 LTS, x86_64
- Instance: `m7i-flex.large`
- Compute: 2 vCPUs and 8 GiB RAM
- Storage: 30 GB gp3
- Container limit: 2 CPUs and 6 GiB RAM
- Public address: associated Elastic IP
- Service port: `8080`

The container preloads Florence synchronously before Gunicorn accepts traffic. This prevents the service from reporting ready before the model can process an image.

```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker

cd ~/urban-pulse-florence
docker build -t urban-pulse-florence:prod .
```

Create `~/florence.env` and protect it:

```env
FLORENCE_SERVICE_TOKEN=REPLACE_WITH_A_LONG_RANDOM_SECRET
REQUIRE_SERVICE_TOKEN=true
FLORENCE_WARMUP=true
```

```bash
chmod 600 ~/florence.env

docker run -d \
  --name urban-pulse-florence \
  --restart unless-stopped \
  --memory 6g \
  --cpus 2 \
  --env-file ~/florence.env \
  -p 8080:8080 \
  urban-pulse-florence:prod
```

The EC2 security group must permit the selected source to reach TCP port `8080`. Port `22` should remain restricted to the maintainer's IP. The analysis endpoint remains protected by the application token even though health endpoints are public.

After deployment, verify:

```bash
curl -s http://ELASTIC_IP:8080/health
curl -s http://ELASTIC_IP:8080/ready
curl -s -X POST http://ELASTIC_IP:8080/v1/analyze \
  -H "X-Urban-Pulse-Vision-Token: YOUR_SECRET" \
  -F "image=@test-incident.jpg"
```

Do not connect Render until `/ready` returns `200` and the authenticated smoke test returns `schemaVersion: "1.0"`.

Configure the Render AI service with:

```env
FLORENCE_REMOTE_ENABLED=true
FLORENCE_SERVICE_URL=http://ELASTIC_IP:8080
FLORENCE_SERVICE_TOKEN=THE_SAME_SECRET_AS_EC2
FLORENCE_ALLOW_HTTP=true
FLORENCE_TIMEOUT_SECONDS=80
FLORENCE_MAX_RETRIES=0
FLORENCE_ENABLED=false
FLORENCE_WARMUP=false
```

Direct HTTP is suitable only for the current controlled college demonstration. It does not encrypt images or the service token in transit. Add HTTPS before broader use and then set `FLORENCE_ALLOW_HTTP=false`.

## Operations

```bash
docker ps
docker logs --tail 200 urban-pulse-florence
docker restart urban-pulse-florence
```

Stopping the EC2 instance stops compute billing, although storage and public IPv4 charges may remain. Starting the instance again restores the container through `--restart unless-stopped`; wait for `/ready` before testing an image.
