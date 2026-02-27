---
on: pull_request

permissions:
  contents: read
  pull-requests: read

safe-outputs:
  add-comment:
    target: 'triggering' # Ensures the comment is posted on the PR that started the workflow

mcp-servers:
  safedep:
    url: 'https://mcp.safedep.io/model-context-protocol/threats/v1/mcp'
    headers:
      Authorization: '${{ secrets.SAFEDEP_API_TOKEN }}'
      X-Tenant-ID: '${{ secrets.SAFEDEP_TENANT_ID }}'
    allowed: ['*']
---

# SafeDep Security Check

Your task is to use SafeDep security checks to determine if the OSS packages introduced or updated in the Pull Request are safe to merge.
