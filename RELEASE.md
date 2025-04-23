# Release Process

This document describes how to create a new release of the `react-native-leaflet-view` package.

## Preparation

1. Make sure all your changes are committed and pushed to the main branch.
2. Pull the latest changes from the main branch:
   ```
   git checkout main
   git pull origin main
   ```

3. Fix any linting issues:
   ```
   yarn lint --fix
   ```

## Release Process

There are two ways to create a release:

### Using release-it (automated way)

1. Make sure you're logged in to npm:
   ```
   npm login
   ```

2. Run the release command:
   ```
   yarn release
   ```
   
   This will:
   - Prompt you for the new version (patch, minor, major)
   - Update the version in package.json
   - Create a git commit with the version change
   - Create a git tag
   - Push the changes and tag to GitHub
   - Publish the package to npm
   - Create a GitHub release

3. If you want to specify the version type:
   ```
   yarn release patch   # For bug fixes (1.0.0 -> 1.0.1)
   yarn release minor   # For new features (1.0.0 -> 1.1.0)
   yarn release major   # For breaking changes (1.0.0 -> 2.0.0)
   ```

### Manual Release Process

If you prefer more control over the process, follow these steps:

1. Make sure you're logged in to npm:
   ```
   npm login
   ```

2. Update the version in package.json using npm (this also creates a git tag):
   ```
   npm version patch   # For bug fixes (1.0.0 -> 1.0.1)
   npm version minor   # For new features (1.0.0 -> 1.1.0)
   npm version major   # For breaking changes (1.0.0 -> 2.0.0)
   ```

   Or manually edit package.json and create a tag:
   ```
   # After editing package.json
   git add package.json
   git commit -m "chore: bump version to X.Y.Z"
   git tag -a vX.Y.Z -m "Version X.Y.Z"
   ```

3. Push the changes and tags to GitHub:
   ```
   git push origin main --tags
   ```

4. Build and publish the package to npm:
   ```
   npm publish
   ```

5. Create a GitHub release (either through the GitHub web interface or using the GitHub CLI):
   ```
   gh release create vX.Y.Z --title "Version X.Y.Z" --notes "Release notes here"
   ```

## Troubleshooting

### Version already exists on npm

npm doesn't allow publishing the same version twice. If a version already exists, you'll need to increment to a new version.

To check currently published versions:
```
npm view react-native-leaflet-view versions
```

### Linting issues

If there are linting issues preventing the commit, fix them:
```
yarn lint --fix
```

Or for specific files:
```
yarn eslint "src/LeafletView/index.tsx" --fix
```

## Notes

- Once a version is published to npm, it cannot be removed or republished with the same version number.
- Make sure to update the README.md if there are significant changes in the new release.
- Consider updating the example app to showcase new features. 