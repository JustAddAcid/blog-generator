module.exports = {
  plugins: [
    'tailwindcss',
    ...(process.env.NODE_ENV === 'production'
      ? []
      // [
      //     [
      //       '@fullhuman/postcss-purgecss',
      //       {
      //         content: [
      //           './pages/**/*.{js,jsx,ts,tsx}',
      //           './components/**/*.{js,jsx,ts,tsx}',
      //           'prismjs/themes/*.{css}'
      //         ],
      //         defaultExtractor: content =>
      //           content.match(/[\w-/:]+(?<!:)/g) || [],
      //       },
      //     ],
      //   ]
      : []),
    'postcss-preset-env',
  ],
}
