import cloudflare from "@sveltejs/adapter-cloudflare";
import node from "@sveltejs/adapter-node";
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const adapter = process.env.ADAPTER === 'node' ? node : cloudflare;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess()
	],

	kit: {
		adapter: adapter(),
		prerender: {
        origin: 'http://localhost:4173'
      }
	}
};

export default config;