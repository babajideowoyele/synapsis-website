# MaskAnyone server deployment with Ansible

> **Status: draft, not yet validated.** This playbook automates the official
> [MaskAnyoneProdInfrastructure](https://github.com/MaskAnyone/MaskAnyoneProdInfrastructure)
> "Setup (Main Server)" steps and adds lessons from the Radboud deployment. The validated
> playbooks are maintained by Radboud TSG (Humanities Lab); this version will be checked
> against them. Try it on a test server first.

## What it does

1. Checks the host: free disk space on project storage, NVIDIA driver (GPU mode).
2. Installs Docker Engine and the Compose plugin if they are missing.
3. Clones MaskAnyoneProdInfrastructure, keeps `./data` on project storage, writes `.env`.
4. Starts Postgres, then the proxy, frontend, backend and Keycloak, in the documented order.
5. Optionally puts Apache in front with your institution's TLS certificate.
6. **Pauses** while you create the Keycloak realm and first user in the admin UI
   (the same manual step as upstream), then fetches the realm's public key itself.
7. Starts the workers, checks the frontend responds, and installs a nightly database backup.

Not included: NVIDIA driver installation, federated/institutional login (site-specific),
extra worker servers.

## Requirements

- Debian or Ubuntu server with sudo, reachable over SSH
- For GPU mode: a modern NVIDIA GPU with driver and `nvidia-container-toolkit` installed
- 50 GB free on the data volume (more for video storage)
- A DNS name and TLS certificate if Apache fronts it
- On your laptop: `ansible-core` 2.15+ and
  `ansible-galaxy collection install community.general`

## Run

```bash
cp inventory.ini.example inventory.ini
cp group_vars/all.yml.example group_vars/all.yml   # set hostname, paths, GPU, Apache
ansible-playbook -i inventory.ini deploy.yml --ask-become-pass \
  -e db_password='<32 random chars>' -e kc_admin_password='<different 32 random chars>'
```

Re-running is safe: the repository is not re-cloned, the public key in `.env` is kept,
and the realm step is skipped once the realm exists.

## Lessons from the Radboud deployment built in

| Problem seen | How the playbook avoids it |
|---|---|
| Apache live on :80 with ProxyPass commented out, so MaskAnyone looked broken | Writes and enables the vhost, runs `apache2ctl configtest` |
| Token issuer set to an internal IP: every login failed | Refuses `localhost`/IPs as hostname; sets `BACKEND_AUTH_ISSUER` from the public URL |
| 5 GB home quota too small for model weights and uploads | Keeps `./data` on `data_dir` and checks free space |
| Platform left in `local` mode, bypassing login | Uses the `server` compose files only |
| Data lost on `docker compose down -v` | Nightly `pg_dumpall`, 30 days kept |

## For validation (Radboud TSG)

Points to check against the working Radboud playbooks:

- [ ] `BACKEND_AUTH_ISSUER` is the right variable name (the upstream README spells it `BACKEND_AUtH_ISSUER`)
- [ ] Proxying Apache to the container's self-signed HTTPS on `127.0.0.1:8443` (vs. another setup)
- [ ] WebSocket rewrite needed, and correct for the current frontend
- [ ] Image version 0.4.6 works with the `master` branch of MaskAnyoneProdInfrastructure
- [ ] Keycloak `maskanyone-fe` client: Root URL and redirect URI steps are complete
- [ ] Anything the Radboud playbooks do that this one misses

Feedback: babajide.owoyele@ru.nl
