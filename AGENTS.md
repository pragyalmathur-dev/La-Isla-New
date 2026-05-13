# Project Instructions & Constraints

## Asset Preservation
- **CRITICAL**: Never delete, move, or overwrite any files in the `/public/assets/` directory or its subdirectories (like `/public/assets/plans/`).
- These files are manually uploaded by the user and are the source of truth for the site plan and villa floor plans.
- If a file is missing from a `list_dir` result, assume it is an environment indexing delay and DO NOT attempt to "clean up" the directory.

## Map Calibration
- The current site plan calibration is sensitive. Always refer to the `config` state in `App.tsx` before making any layout changes.
- Current Anchor: `lat: 14.95031, lng: 74.05325`
- Current Scale: `H: 411.40, W: 364.40`
- Current Rotation: `-2.36`
