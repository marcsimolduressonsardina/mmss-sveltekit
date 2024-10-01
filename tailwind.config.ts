import { join } from 'path';
import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

// 1. Import the Skeleton plugin
import { skeleton } from '@skeletonlabs/tw-plugin';

const config = {
	// 2. Opt for dark mode to be handled via the class method
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		// 3. Append the path to the Skeleton package
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {
			keyframes: {
				loadtwo: {
					'50%': { transform: 'rotate(-80deg)' }
				},
				glow: {
					'0%, 100%': {
						boxShadow: '0 0 15px rgba(236, 72, 153, 0.7), 0 0 20px rgba(59, 130, 246, 0.7)'
					},
					'50%': { boxShadow: '0 0 30px rgba(236, 72, 153, 1), 0 0 35px rgba(59, 130, 246, 1)' }
				}
			},
			animation: {
				loadtwo: 'loadtwo 3s ease-in-out infinite',
				glow: 'glow 3s ease-in-out infinite'
			}
		}
	},
	plugins: [
		forms,
		// 4. Append the Skeleton plugin (after other plugins)
		skeleton({
			themes: { preset: ['skeleton'] }
		})
	]
} satisfies Config;

export default config;
