# Imaging Platform Mode

This package is a thin overlay mode that extends `@ohif/mode-basic`.

Purpose:
- Keep upstream `mode-basic` mergeable.
- Put product-specific mode behavior in one package.

Implementation note:
- This mode currently inherits all behavior from basic mode and is intended
  to be the primary place for future product-specific route/toolbar/panel
  overrides.
