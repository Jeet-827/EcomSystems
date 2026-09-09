const fs = require('fs');
const path = require('path');

const removeLogs = (dir) => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let changed = 0;
  
  for (const file of files) {
    if (file.name === 'node_modules') continue;
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      changed += removeLogs(fullPath) || 0;
      continue;
    }
    
    if (!file.name.endsWith('.js') && !file.name.endsWith('.jsx')) continue;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Remove lines that have console.error('❌ ...')
    content = content.replace(/^.*console\.error\([\"']❌ .*$/gm, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      changed++;
    }
  }
  return changed;
};

let total = 0;
total += removeLogs(path.join(__dirname, 'Backend')) || 0;
total += removeLogs(path.join(__dirname, 'Admin')) || 0;
total += removeLogs(path.join(__dirname, 'Frontend', 'src')) || 0;
console.log('Removed logs from ' + total + ' files');
