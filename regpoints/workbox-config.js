module.exports = {
	globDirectory: 'RegPoint/',
	globPatterns: [
		'**/*.{otf,css,js,html}'
	],
	swDest: 'RegPoint/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	swDest: './sw.js'
};