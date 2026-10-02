# Figma Jev Review

**Review explicitly selected interface copy against declared criteria and jump back to the exact weak TextNodes.**

[![Tests](https://github.com/gbesse/figma-jev-review/actions/workflows/test.yml/badge.svg)](https://github.com/gbesse/figma-jev-review/actions/workflows/test.yml) [MIT](LICENSE) · Figma Plugin API · TypeScript · Public alpha

The plugin never writes copy. Pass one scores visible criteria; only weak criteria trigger pass two, where Jev selects among the exact TextNodes already present in the selection. Clicking a citation selects and zooms to that original node.

## Development install

```sh
npm ci
npm run build
```

In Figma Desktop choose **Plugins → Development → Import plugin from manifest**, then select `manifest.json`. Replace the placeholder manifest ID with the one Figma assigns before Community publication.

Select a frame or text layers, open **Jev Copy Review**, choose a pack, enter a TypeSafe key, and press **Review selected copy**. The key is not persisted. Paid requests go directly to `https://api.typesafe.ai/v1/systemone` only after that click.

## How it decides

`generic` and `checkout` packs declare exact `noul` or `score` questions and illustrative weak thresholds. Pass one shares a state containing the selected node IDs, names and text. Pass two offers at most those 255 nodes as choice candidates. Scores are normalized in code; citations are looked up by node ID, never paraphrased.

Use `npm run demo` for the built offline panel path. Synthetic core tests make no network calls. See [privacy](docs/privacy.md).

## Try an exact TextNode citation offline

`npm run demo:citation` supplies synthetic checkout answers, identifies a weak renewal criterion and maps its citation back to one selected TextNode. No Figma session or Jev request is needed. It previews the core identity contract, not the in-app selection or zoom behavior.

## Boundaries and validation

This is a copy review aid, not accessibility conformance, legal review, design scoring, or an editor. Figma text can contain instructions that affect the judgment. English works best. Thresholds are not calibrated.

`npm run check` typechecks and checks the network-restricted manifest; `npm test` rebuilds and tests request shapes, response validation and citation fidelity. The plugin was not loaded into Figma Desktop in this environment and has not been submitted to Figma Community.

## Related projects

[Jev Judgment Wall](https://github.com/gbesse/jev-judgmentwall) · [Jev Roast](https://github.com/gbesse/jev-roast) · [DecisionPacks](https://github.com/gbesse/decisionpacks) · [Jev A11y](https://github.com/gbesse/jev-a11y)

Independent project; not affiliated with TypeSafe AI or Figma. [TypeSafe API](https://docs.typesafe.ai/api) · [Figma Plugin API](https://developers.figma.com/docs/plugins/)
