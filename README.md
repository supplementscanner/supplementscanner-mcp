# Supplementscanner MCP Server

**Supplementscanner is a hosted MCP server for supplement price comparison.** It gives AI assistants such as Claude, ChatGPT, Cursor and VS Code live prices from supplement web stores across Europe, normalized to a price per kg, per serving or per capsule. It is free and read-only, and it needs no API key or account.

We scan. You save.

```
https://mcp.supplementscanner.eu
```

## What it does

A sticker price says little about value. A 2.5 kg tub of whey and a 900 g pouch, or a jar of 60 capsules and one of 240, only become comparable once the price is divided by what the pack holds. Supplementscanner scans supplement stores continuously and does that division for every product, so each category can be ordered by the price you actually pay per unit.

This MCP server gives an assistant the same view. Ask where whey isolate, creatine monohydrate, magnesium bisglycinate or vitamin D3 costs least per unit, and it answers from live prices, with the store, the pack size, the unit price and a link to buy.

- **Per-unit prices:** every product is compared on its category's unit: per kg for powders, per serving or per capsule for the rest.
- **Live data:** prices are refreshed around the clock, and every response says when the data was last scanned.
- **Eight markets:** the Netherlands, Belgium, France, the United Kingdom, Poland, Denmark, Spain and Austria, each in its own currency.
- **No setup:** one HTTPS endpoint, streamable HTTP transport, no authentication.

## Tools

All four tools are read-only.

| Tool | What it does | Main arguments |
| --- | --- | --- |
| `find_cheapest` | Products in a category and all its subcategories, ordered by lowest price per unit. Start here. | `category_slug`, `limit`, `in_stock_only`, `market` |
| `list_categories` | The category tree, each category with a live product count, store count and lowest unit price. Use it to find a `category_slug`. | `market` |
| `search_products` | Typo-tolerant search across the whole catalogue by product name or brand. | `query`, `category_slug`, `max_unit_price_cents`, `in_stock_only`, `limit`, `market` |
| `get_product` | One product in full: price, unit price, size, bulk discount tiers, buy link and recent price history. | `product_id`, `market` |

Money comes back as integer cents plus a string formatted for the market's locale. Every response carries `last_scraped_at`, so an assistant can tell the user how fresh a price is.

### Example prompts

- "Where do I pay the least per kg for whey isolate in the Netherlands?"
- "Compare vitamin D3 capsules on price per capsule in Belgium, in stock only."
- "Which creatine monohydrate has the lowest price per kilo right now?"
- "Has the price of this magnesium bisglycinate changed recently?"

## Markets

| Country | Site | `market` | Country endpoint |
| --- | --- | --- | --- |
| Netherlands | [supplementenscanner.nl](https://supplementenscanner.nl) | `nl` | `https://mcp.supplementenscanner.nl` |
| Belgium | [supplementscanner.be](https://supplementscanner.be) | `be` | `https://mcp.supplementscanner.be` |
| France | [supplementscanner.fr](https://supplementscanner.fr) | `fr` | `https://mcp.supplementscanner.fr` |
| United Kingdom | [supplementscanner.co.uk](https://supplementscanner.co.uk) | `gb` | `https://mcp.supplementscanner.co.uk` |
| Poland | [supplementscanner.pl](https://supplementscanner.pl) | `pl` | `https://mcp.supplementscanner.pl` |
| Denmark | [supplementscanner.dk](https://supplementscanner.dk) | `dk` | `https://mcp.supplementscanner.dk` |
| Spain | [suplementoscanner.es](https://suplementoscanner.es) | `es` | `https://mcp.suplementoscanner.es` |
| Austria | [supplementscanner.at](https://supplementscanner.at) | `at` | `https://mcp.supplementscanner.at` |

In the Netherlands the service is called Supplementenscanner, and in Spain Suplementoscanner.

`https://mcp.supplementscanner.eu` answers for every market. Without a `market` argument it answers for the Netherlands; pass `market: "be"` for Belgian prices, `market: "gb"` for British ones, and so on. Each country also has an endpoint of its own, which defaults to that country and otherwise works the same way.

## Connect

### Claude

**Claude.ai and Claude Desktop:** open Settings, then Connectors, choose *Add custom connector*, and paste `https://mcp.supplementscanner.eu`.

**Claude Code:**

```sh
claude mcp add --transport http supplementscanner https://mcp.supplementscanner.eu
```

### ChatGPT

In developer mode, add a connector with the URL `https://mcp.supplementscanner.eu` and no authentication.

### Cursor

`~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supplementscanner": {
      "url": "https://mcp.supplementscanner.eu"
    }
  }
}
```

### VS Code

`.vscode/mcp.json`:

```json
{
  "servers": {
    "supplementscanner": {
      "type": "http",
      "url": "https://mcp.supplementscanner.eu"
    }
  }
}
```

### Windsurf

`~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "supplementscanner": {
      "serverUrl": "https://mcp.supplementscanner.eu"
    }
  }
}
```

### Cline

`cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "supplementscanner": {
      "type": "streamableHttp",
      "url": "https://mcp.supplementscanner.eu"
    }
  }
}
```

### Gemini CLI

`~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "supplementscanner": {
      "httpUrl": "https://mcp.supplementscanner.eu"
    }
  }
}
```

### Codex CLI

`~/.codex/config.toml`:

```toml
[mcp_servers.supplementscanner]
url = "https://mcp.supplementscanner.eu"
```

### Clients that only run local commands

The `supplementscanner-mcp` npm package is a stdio bridge: it passes every message to the hosted endpoint unchanged and holds no logic of its own. It needs Node.js 18 or later.

```json
{
  "mcpServers": {
    "supplementscanner": {
      "command": "npx",
      "args": ["-y", "supplementscanner-mcp"]
    }
  }
}
```

It connects to `https://mcp.supplementscanner.eu` by default. To connect to a country's own endpoint instead, add its `market` code to `args` (`["-y", "supplementscanner-mcp", "be"]`) or set `SUPPLEMENTSCANNER_MARKET`.

## FAQ

### Is the Supplementscanner MCP server free?

Yes. The hosted server is free to use, with no API key, no account and no sign-up. Connect any MCP client to `https://mcp.supplementscanner.eu` and call the tools.

### How are supplement prices compared?

Products are compared within their category on one unit: per kg for protein powder, creatine and other powders, per capsule or tablet for capsule products, and per serving where that is how a product is taken. The pack size comes from the store's own listing. A product whose size cannot be read gets no unit price, rather than a guessed one.

### Which countries and stores are covered?

The Netherlands, Belgium, France, the United Kingdom, Poland, Denmark, Spain and Austria. Each market is priced in its own currency (euros, pounds, złoty or kroner), and every response states the market it is scoped to. Markets and stores are added over time, and `list_categories` returns the live store count for each category.

### How up to date are the prices?

Prices are refreshed continuously, and the products people see most are checked most often. Every response includes `last_scraped_at`, the time the data was last scanned.

### Do affiliate commissions change the ranking?

No. `find_cheapest` orders by price per unit, and `search_products` by relevance and then price per unit. See [Affiliate links](#affiliate-links).

### Is there a REST API as well?

Yes. The same catalogue is available as a JSON API at `https://api.supplementscanner.eu/v1`, described by an [OpenAPI document](https://api.supplementscanner.eu/v1/openapi.json).

## Affiliate links

Buy links are affiliate links: when someone buys through one, the store may pay Supplementscanner a commission. Commission plays no part in the order of results. Every response that shows prices includes an `affiliate_disclosure` string, and assistants are asked to pass it on.

## Also available

- JSON API: `https://api.supplementscanner.eu/v1` ([OpenAPI](https://api.supplementscanner.eu/v1/openapi.json))
- [`llms.txt`](https://supplementscanner.eu/llms.txt)
- Developer page: [supplementscanner.eu/developers](https://supplementscanner.eu/developers)
- Methodology: [supplementscanner.eu/methodology](https://supplementscanner.eu/methodology)

## Privacy

See the [privacy policy](https://supplementenscanner.nl/privacy).

## Support

Questions, a wrong price or a store we should scan: open an issue in this repository.

## License

The code and documentation in this repository are MIT licensed. The price data the hosted service returns is not covered by it.
