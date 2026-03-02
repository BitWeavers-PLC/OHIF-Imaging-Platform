# Upstream Upgrade Playbook

## Branch model
- `vendor/upstream/<version>`: pure upstream sync, no product commits.
- `integration/<version>`: merge upstream + apply/verify compatibility.
- `main`: release branch for Imaging Platform.

## Upgrade steps
1. Fetch upstream and create `vendor/upstream/<version>` from upstream tag.
2. Merge `vendor/upstream/<version>` into `integration/<version>`.
3. Reconcile only documented core patches from `PATCH_REGISTRY.md`.
4. Run regression checks:
   - Toolbar responsiveness and `More` behavior.
   - Study browser default view/thumbnail rendering.
   - Branding and route asset loading.
   - Viewer launch with your datasource.
5. Promote integration branch to `main` after validation.

## Guardrails
- Do not add product behavior directly to upstream core unless unavoidable.
- If core patch count increases, update `PATCH_REGISTRY.md` in same PR.
- Prefer customization modules/config keys over direct component edits.
