const path = require('path');
const fs = require('fs');

const tsConfigPath = path.join(__dirname, 'tsconfig.json');
const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

module.exports = {
  resolve: {
    alias: {
      ...Object.entries(tsConfig.compilerOptions.paths || {}).reduce(
        (aliases, [key, [value]]) => {
          aliases[key.replace('/*', '')] = path.resolve(__dirname, value[0].replace('/*', ''));
          return aliases;
        },
        {}
      )
    }
  }
};