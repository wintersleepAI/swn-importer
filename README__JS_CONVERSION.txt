# JS Conversion Drop-in

This archive provides a drop-in set of files to convert the repo to plain JavaScript.

## Files included
- `.babelrc`
- `webpack.config.js` (ESM)
- `scripts/jsify.mjs`

## Steps
1. Extract this zip at the **repo root** (so `.babelrc` sits alongside `package.json`).
2. Update your `package.json`:
   - Add devDependencies:
     - `@babel/core`, `@babel/preset-env`, `babel-loader`, `webpack`, `webpack-cli`
   - Add scripts:
     ```json
     {
       "build": "webpack --mode=production",
       "dev": "webpack --watch --mode=development",
       "jsify": "node scripts/jsify.mjs"
     }
     ```
3. Run the conversion and build:
   ```bash
   npm install
   npm run jsify   # converts src/*.ts -> src/*.js
   npm run build
   ```
4. Ensure your manifest points at `dist/module.js` (esmodules or scripts).
