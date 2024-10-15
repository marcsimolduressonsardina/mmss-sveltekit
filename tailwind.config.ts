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
				siriGlow: {
					'0%, 100%': {
						boxShadow: `
							-10px -5px 20px rgba(236, 72, 153, 0.7),
							10px 5px 30px rgba(59, 130, 246, 0.6),
							-15px 10px 40px rgba(72, 191, 227, 0.6)`,
						transform: 'rotate(0deg) scale(1)' // Base size
					},
					'25%': {
						boxShadow: `
							5px -15px 25px rgba(236, 72, 153, 1),
							-10px 15px 45px rgba(59, 130, 246, 1),
							15px -10px 55px rgba(72, 191, 227, 1)`,
						transform: 'rotate(10deg) scale(1.1)' // Slight rotation and scale
					},
					'50%': {
						boxShadow: `
							-12px 10px 35px rgba(236, 72, 153, 0.9),
							15px -10px 50px rgba(59, 130, 246, 0.8),
							-8px 15px 60px rgba(72, 191, 227, 0.8)`,
						transform: 'rotate(20deg) scale(1.2)' // Peak size
					},
					'75%': {
						boxShadow: `
							15px -12px 30px rgba(236, 72, 153, 0.8),
							-15px 10px 40px rgba(59, 130, 246, 0.7),
							10px -15px 50px rgba(72, 191, 227, 0.7)`,
						transform: 'rotate(-10deg) scale(1.05)' // Return to smaller size
					}
				}
			},
			animation: {
				siriGlow: 'siriGlow 2.5s ease-in-out infinite' // Slightly faster, smoother animation
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
