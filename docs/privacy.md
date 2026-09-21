# Privacy and review contract

The plugin reads only TextNodes under the explicit current selection. It sends node IDs, layer names, and text only after **Review selected copy** is pressed. The API key remains in the password field for the panel lifetime and is not written to client storage, plugin data, the Figma document, logs, or exports.

Clicking a weak result changes the selection and viewport; it does not rewrite copy. Figma file contents can still be sensitive. Designers must obtain appropriate authorization before sending selected text to a third-party API.
