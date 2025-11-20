# n8n-nodes-lomavis

This is an n8n community node for integrating with the Lomavis social media management platform.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Lomavis](https://lomavis.com) is a comprehensive social media management platform that helps businesses manage their social media presence across multiple platforms.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-lomavis` in **Enter npm package name**
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes
5. Select **Install**

### Manual Installation

To install manually, run:

```bash
npm install n8n-nodes-lomavis
```

For local development:

```bash
# In this repository
npm install
npm run build
npm link

# In your n8n installation custom folder (~/.n8n/custom)
npm link n8n-nodes-lomavis
```

## Operations

### Profile Group

- **List**: Get all profile groups with their associated social media accounts

## Credentials

You need a Lomavis API key to use this node. You can find your API key in your Lomavis account settings under API Access.

## Compatibility

Tested with n8n version 1.112.3+

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Lomavis API Documentation](https://app.lomavis.com/api/docs/)

## Development

```bash
# Install dependencies
npm install

# Build the node
npm run build

# Watch for changes
npm run build:watch

# Run linter
npm run lint

# Format code
npm run format
```

## License

[MIT](LICENSE.md)
