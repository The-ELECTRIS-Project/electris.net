// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
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
