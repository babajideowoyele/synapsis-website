# MaskAnyone Deployment Checklist

**SYNAPSIS Project - University Cluster Deployment Guide**

---

## Deployment Information

| Field | Value |
|-------|-------|
| **Institution** | [University/Organization] |
| **Cluster/Server** | [Name and type] |
| **Deployment Lead** | [Name, Email] |
| **Target Date** | [DD/MM/YYYY] |
| **Deployment Mode** | Local Docker / HPC Cluster / Cloud |

---

## 1. Prerequisites

### Hardware Requirements

| Resource | Minimum | Recommended | Your Setup |
|----------|---------|-------------|------------|
| **GPU** | 1x NVIDIA T4 (16GB) | 1x A100 (40GB) | |
| **GPU VRAM** | 8 GB | 16 GB | |
| **System RAM** | 32 GB | 64 GB | |
| **Storage** | 50 GB | 200 GB | |
| **CPU Cores** | 8 | 16+ | |

### Software Requirements

- [ ] Docker Engine 24+ or Podman 4+
- [ ] Docker Compose v2
- [ ] NVIDIA Container Toolkit (for GPU services)
- [ ] CUDA 12.x drivers installed
- [ ] OpenSSL (for certificate generation)
- [ ] Git

### Network Requirements

- [ ] Outbound HTTPS access (for Docker image pulls)
- [ ] Inbound port 80 or 443 available (for web interface)
- [ ] Internal DNS or IP for service access

---

## 2. Security Setup

### Credentials

- [ ] Copy `app.env.example` to `app.env`
- [ ] Generate strong Postgres password (replace `CHANGE_ME`)
- [ ] Generate strong Keycloak admin password
- [ ] Generate worker API key (`openssl rand -hex 32`)
- [ ] Generate pgAdmin credentials (or exclude pgAdmin in production)
- [ ] Set Keycloak database credentials

### SSL/TLS

- [ ] Run `bash scripts/generate-ssl.sh` for development certificates
- [ ] For production: obtain institutional certificate or use Let's Encrypt
- [ ] For behind-proxy deployment: use `www-http.conf` (HTTP-only)

### Access Control

- [ ] Verify `MASK_ANYONE_PLATFORM_MODE=server` (not `local`)
- [ ] Configure Keycloak realm and client
- [ ] Create initial user accounts
- [ ] Disable pgAdmin in production (`docker-compose.production.yml`)

---

## 3. Deployment Steps

### Docker Images

- [ ] Pull images: `docker compose pull` (or build locally)
- [ ] Verify image sizes (total ~15 GB for all services)
- [ ] Confirm GPU access: `docker run --rm --gpus all nvidia/cuda:12.6.0-base-ubuntu22.04 nvidia-smi`

### Database Initialization

- [ ] Start postgres: `docker compose up -d postgres`
- [ ] Verify databases created (prototype + keycloak)
- [ ] Check init scripts ran: `002_retention.sql` for timestamps and cascades

### Service Startup

Development mode:
```bash
docker compose up -d
```

Production mode (recommended):
```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

### Verification

- [ ] All containers running: `docker compose ps`
- [ ] Backend healthy: `curl http://localhost:8000/platform/mode`
- [ ] Worker registered: check backend logs
- [ ] Frontend accessible: open browser to configured URL
- [ ] GPU processing works: upload test video and run masking job
- [ ] Audit logs visible: `docker compose logs python | grep '"action"'`

---

## 4. Post-Deployment

### Monitoring

- [ ] Set up log rotation for Docker containers
- [ ] Monitor GPU memory usage (`nvidia-smi`)
- [ ] Configure alerting for service failures

### Documentation

- [ ] Document access URL for users
- [ ] Create user accounts for pilot participants
- [ ] Share quick-start guide with research team
- [ ] Record deployment configuration for reproducibility

### Data Management

- [ ] Confirm data retention policy with privacy officer
- [ ] Set `RETENTION_DAYS` environment variable
- [ ] Verify cascade deletes work (delete test video, check results removed)
- [ ] Schedule regular backups of postgres volume

---

## 5. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| GPU not detected | Check NVIDIA Container Toolkit: `nvidia-ctk runtime configure` |
| Out of VRAM | Set `SAM2_OFFLOAD_STATE_TO_CPU=true` in `app.env` |
| Worker can't connect | Verify `WORKER_API_KEY` matches in backend and worker |
| Keycloak login fails | Check `KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD` in `app.env` |
| Video upload fails | Check `client_max_body_size` in nginx config (default: 200M) |
| Behind reverse proxy | Use `www-http.conf` and ensure proxy forwards headers |

### Minimum Viable Deployment

If resources are limited, these services are essential:

| Service | Required | Notes |
|---------|----------|-------|
| nginx | Yes | Reverse proxy |
| python (FastAPI) | Yes | Backend API |
| postgres | Yes | Database |
| worker | Yes | Job processing |
| sam2 | Yes | Core segmentation (GPU) |
| openpose | Optional | Can use MediaPipe (CPU) instead |
| keycloak | Optional | Disable for local-only demo |
| pgadmin | No | Development tool only |
| mesh3d | Optional | 3D body model overlay |

---

## Notes

| Date | Update |
|------|--------|
| | |
