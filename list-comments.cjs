const { execSync } = require('child_process');
const fs = require('fs');

const files = execSync('git ls-files "src/**/*.js" "src/**/*.jsx" "api/**/*.js"')
  .toString()
  .split('\n')
  .filter(Boolean);

const results = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  let commentCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (
      trimmed.startsWith('//') &&
      !trimmed.includes('eslint-disable') &&
      !trimmed.includes('eslint-enable') &&
      !trimmed.includes('eslint-env')
    ) {
      commentCount++;
      continue;
    }

    if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/')) {
      commentCount++;
      continue;
    }

    if (trimmed.includes('/*') || trimmed.includes('*/')) {
      commentCount++;
      continue;
    }

    const commentIdx = line.indexOf('//');
    if (commentIdx !== -1) {
      const before = line.substring(0, commentIdx);
      const singleQuotes = (before.match(/'/g) || []).length;
      const doubleQuotes = (before.match(/"/g) || []).length;
      const backticks = (before.match(/`/g) || []).length;

      if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0 && backticks % 2 === 0) {
        if (!trimmed.includes('eslint-disable') && !trimmed.includes('eslint-enable') && !trimmed.includes('eslint-env')) {
          commentCount++;
        }
      }
    }
  }

  if (commentCount > 0) {
    results.push({ file: f, count: commentCount });
  }
}

results.sort((a, b) => b.count - a.count);

for (const r of results) {
  console.log(`${r.file}: ~${r.count} comment lines`);
}

console.log(`\nTotal files with comments: ${results.length}`);
console.log(`Total comment lines: ${results.reduce((sum, r) => sum + r.count, 0)}`);
