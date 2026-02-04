# Auto-deploy on GitHub push

When you push to the `main` branch, GitHub Actions SSHs into your server and runs the deploy script (`deploy-tobo.sh`), so you don’t have to log in and run it manually.

**Server:** Ubuntu (Debian-based). Commands below are for Ubuntu.

## 1. One-time setup

### A. Ubuntu server – deploy user and Docker

Docker is already installed. Ensure the user you use for deploys (e.g. `deploynew`) can run `docker compose` without sudo:

```bash
# Add deploy user to docker group (replace deploynew with your SSH user)
sudo usermod -aG docker deploynew
```

Log out and back in (or open a new SSH session) so the group change applies. Then run `docker compose version` to confirm it works without sudo.

### B. SSH key for GitHub Actions (on your server)

On the **server** (as the user that runs deploys, e.g. `deploynew`), create a key used only for GitHub Actions:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""
```

- Add the **public** key to the server’s `authorized_keys` so the deploy user can run the script:

  ```bash
  cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
  ```

- Copy the **private** key once (you’ll paste it into GitHub):

  ```bash
  cat ~/.ssh/github_deploy
  ```

  Copy the full output, including `-----BEGIN ... KEY-----` and `-----END ... KEY-----`.

### C. Add GitHub repository secrets

In your GitHub repo:

1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** for each of:

| Secret name       | Example value                          | Description                          |
|-------------------|----------------------------------------|-------------------------------------|
| `DEPLOY_HOST`     | `srv504049.yourhost.com` or IP         | Server hostname or IP               |
| `DEPLOY_USER`     | `deploynew`                            | SSH user that runs the deploy       |
| `DEPLOY_PATH`     | `/opt/tobodigital/tobodigital-prod`   | Project directory on the server     |
| `SSH_PRIVATE_KEY` | (paste full private key from above)   | Contents of `~/.ssh/github_deploy` |

- `DEPLOY_HOST`: same host you use for `ssh deploynew@...`
- `DEPLOY_USER`: that SSH user (e.g. `deploynew`)
- `DEPLOY_PATH`: the directory that contains `docker-compose.yml` and `deploy-tobo.sh`
- `SSH_PRIVATE_KEY`: entire private key (one secret, multiline is fine)

Save each secret. Do not commit them or put them in code.

## 2. How it works

- **Automatic:** Every push to `main` runs the **Deploy to Server** workflow. It will:
  1. SSH to the server as `DEPLOY_USER@DEPLOY_HOST`
  2. `cd` to `DEPLOY_PATH`
  3. Run `git pull origin main`
  4. Run `./deploy-tobo.sh` (build, down, up, etc.)

- **Manual run:** In the repo go to **Actions** → **Deploy to Server** → **Run workflow** and run it on `main` when you want a deploy without pushing.

## 3. Requirements on the server

- The `DEPLOY_USER` must:
  - Be able to SSH in (key in `authorized_keys`).
  - Have the repo cloned at `DEPLOY_PATH` and be able to `git pull` (no auth issues, or use a deploy key for the repo).
  - Be able to run `docker compose` (user in `docker` group or equivalent).
- `deploy-tobo.sh` must be in `DEPLOY_PATH` and executable (the workflow runs `chmod +x deploy-tobo.sh` before running it).

## 4. Deploy from a different branch

To deploy on push to another branch (e.g. `production`), edit `.github/workflows/deploy.yml` and change:

```yaml
on:
  push:
    branches:
      - production
```

and in the workflow script change `git pull origin main` to `git pull origin production` (or your branch name).

## 5. Troubleshooting

- **Workflow fails on “Permission denied”:** Check that the public key is in `~/.ssh/authorized_keys` for `DEPLOY_USER` and that the private key in `SSH_PRIVATE_KEY` matches.
- **“docker: permission denied” (Ubuntu):** Add the deploy user to the docker group: `sudo usermod -aG docker $USER`. Log out and back in (or reboot) so the group change applies.
- **“git pull” fails:** On the server, ensure `git status` and `git pull` work for that repo (HTTPS token or SSH deploy key for the repo if it’s private).
- **Deploy path wrong:** Double-check `DEPLOY_PATH` (no trailing slash is fine). Run `pwd` in the project dir on the server and use that path.

Once the secrets are set and the server is set up as above, pushing to `main` will auto-deploy using your existing `deploy-tobo.sh` script.
