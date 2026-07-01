#!/usr/bin/env bash
# Build "Nairobi Voices" and deploy to the Bomet server at /voices/.
# Served same-origin so all DIGIT API calls hit Bomet's Kong directly.
set -euo pipefail

SSH_HOST="${SSH_HOST:-egov-bomet}"
WEBROOT="/var/www/voices"
REPO="$(cd "$(dirname "$0")" && pwd)"

echo "==> Building (vite base=/voices/)"
cd "$REPO"
npm run build

echo "==> Syncing dist/ -> ${SSH_HOST}:${WEBROOT}"
ssh "$SSH_HOST" "mkdir -p ${WEBROOT}"
tar -C "$REPO/dist" -czf - . | ssh "$SSH_HOST" "rm -rf ${WEBROOT:?}/* && tar -C ${WEBROOT} -xzf -"

echo "==> Ensuring nginx /voices/ location"
ssh "$SSH_HOST" 'bash -s' <<'REMOTE'
set -e
SITE=/etc/nginx/sites-enabled/bometfeedbackhub.digit.org
python3 - "$SITE" <<'PY'
import sys, re, time
site = sys.argv[1]
src = open(site).read()
if 'location /voices/' in src:
    print('/voices/ location already present'); sys.exit(0)
block = (
    "  # Nairobi Voices citizen-engagement SPA (wired to Bomet PGR)\n"
    "  location = /voices { return 302 /voices/; }\n"
    "  location /voices/ {\n"
    "    add_header Cache-Control \"no-cache\";\n"
    "    root /var/www;\n"
    "    try_files $uri $uri/ /voices/index.html;\n"
    "  }\n\n"
)
# insert right before the dashboard-ui SPA location (same serving pattern)
m = re.search(r"^\s*location /dashboard-ui/ \{", src, re.M)
if not m:
    m = re.search(r"^\s*location / \{", src, re.M)   # fallback: before Kong catch-all
assert m, "no anchor location found"
open(site+".bak-voices-%d"%int(time.time()),"w").write(src)
src = src[:m.start()] + block + src[m.start():]
open(site,"w").write(src)
print("inserted /voices/ location")
PY
nginx -t && systemctl reload nginx
REMOTE

echo "==> Deployed: https://bometfeedbackhub.digit.org/voices/"
