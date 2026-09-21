// Purpose: Produce an offline preview path without opening Figma or contacting Jev.
console.log(`Offline panel preview: ${new URL('../dist/ui-preview.html',import.meta.url).pathname}`);console.log('The preview UI requires Figma selection messages; core behavior is covered by tests.');
