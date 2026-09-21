// Purpose: Compile the pure TypeScript core separately for Node's built-in test runner.
import{build}from'esbuild';import{mkdir}from'node:fs/promises';await mkdir('dist-test',{recursive:true});await build({entryPoints:['src/core.ts'],bundle:false,format:'esm',platform:'node',outdir:'dist-test',target:'node22'});
