# Publishing Turtleman to NPM

This guide will help you publish the Turtleman package to npm.

## Prerequisites

1. **NPM Account**: Make sure you have an npm account at https://www.npmjs.com/
2. **NPM CLI**: Install npm CLI if you haven't already: `npm install -g npm`

## Publishing Steps

### 1. Login to NPM

```bash
npm login
```

Enter your npm username, password, and email when prompted.

### 2. Check Package Configuration

Before publishing, verify your package.json is correct:

```bash
npm pack --dry-run
```

This will show you what files will be included in your package without actually creating it.

### 3. Test Your Package Locally (Optional)

You can test your package locally before publishing:

```bash
npm link
cd /path/to/another/project
npm link turtleman
```

### 4. Publish to NPM

```bash
npm publish
```

If this is your first time publishing this package, it will be published as version 1.0.0.

### 5. Verify Publication

Check that your package is published by visiting:
https://www.npmjs.com/package/turtleman

## Updating the Package

When you make changes to your code:

1. **Update the version** in package.json:

   ```bash
   npm version patch  # for bug fixes (1.0.0 -> 1.0.1)
   npm version minor  # for new features (1.0.0 -> 1.1.0)
   npm version major  # for breaking changes (1.0.0 -> 2.0.0)
   ```

2. **Publish the update**:
   ```bash
   npm publish
   ```

## Package Information

- **Package Name**: turtleman
- **Main File**: Turtleman.js
- **Type**: ES Module
- **License**: MIT
- **Keywords**: turtle-graphics, svg, drawing, graphics, logo, geometric, canvas, visualization, educational, programming

## Troubleshooting

### Package Name Already Taken

If the package name "turtleman" is already taken, you can:

1. Choose a different name (update package.json)
2. Use a scoped package: `@yourusername/turtleman`

### Authentication Issues

If you have trouble logging in:

```bash
npm logout
npm login
```

### Publishing Errors

Make sure you're in the correct directory and all files are committed to git before publishing.

## Useful Commands

- `npm whoami` - Check who you're logged in as
- `npm view turtleman` - View package information
- `npm unpublish turtleman@1.0.0` - Unpublish a specific version (within 72 hours)
- `npm deprecate turtleman@1.0.0 "Use version 2.0.0 instead"` - Deprecate old versions
