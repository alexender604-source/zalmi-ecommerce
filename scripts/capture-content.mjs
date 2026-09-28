import {readFileSync,writeFileSync} from 'node:fs';
const source=readFileSync('components/seo-content.tsx','utf8');
const blocks=[...source.matchAll(/<h[34][^>]*>([\s\S]*?)<\/h[34]>\s*<p>([\s\S]*?)<\/p>/g)].map(m=>({title:m[1].replace(/\s+/g,' ').replaceAll('&apos;',"'").trim(),content:m[2].replace(/\s+/g,' ').trim()}));
writeFileSync('data/seed-seo.json',JSON.stringify(blocks,null,2));
