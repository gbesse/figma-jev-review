// Purpose: Compile the pure TypeScript core and transport separately for Node's built-in test runner.
import{build}from'esbuild';import{mkdir}from'node:fs/promises';await mkdir('dist-test',{recursive:true});await build({entryPoints:{core:'src/core.ts',client:'src/client.ts'},bundle:true,format:'esm',platform:'node',outdir:'dist-test',target:'node22'});
