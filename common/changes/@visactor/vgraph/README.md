# VGraph Changefiles

Place Rush changefiles for `@visactor/vgraph` releases in this directory.

The release workflow reads every `*.json` file here, infers `nextBump` from
`changes[].type`, and sends the full changefile payload to the changelog
generation API for stable releases.

## Recommended workflow

Create changefiles with `rush change --bulk --bump-type <major|minor|patch>`.
In this repo you can also use:

```bash
rush change-all --type patch --message "fix: describe your change"
```

## Required shape

Each changefile should keep the Rush JSON structure below:

```json
{
  "changes": [
    {
      "packageName": "@visactor/vgraph",
      "comment": "Describe the shipped change in one sentence.",
      "type": "patch"
    }
  ],
  "packageName": "@visactor/vgraph",
  "email": "your.name@example.com"
}
```

## Conventions

- `changes` is required and must contain at least one entry.
- `changes[].type` must be one of `major`, `minor`, or `patch`.
- `changes[].comment` should be release-note-ready text.
- Use a unique `*.json` filename. `rush change` generated filenames are fine.
- Do not keep placeholder/template JSON files in this directory because release
  automation consumes every `*.json` file it finds.

See `2026-06-16-release-workflow-bootstrap.json` for the first checked-in
example in this repo.
