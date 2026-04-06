// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface PageData {
			meta?: {
				title?: string;
				description?: string;
				image?: string;
				url?: string;
				type?: string;
				twitterCard?: string;
			};
		}
		interface Platform {
			env?: {
				ASSETS?: {
					fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
				};
				[key: string]: unknown;
			};
		}
	}
}

export {};
