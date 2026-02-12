const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Установка программы...\n');

// 1. Создаем папку для данных
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  console.log('✅ Создана папка для данных');
}

// 2. Устанавливаем зависимости
console.log('\n📦 Установка пакетов...');
execSync('npm install', { stdio: 'inherit' });

// 3. Собираем проект
console.log('\n🔧 Сборка приложения...');
execSync('npm run build', { stdio: 'inherit' });

// 4. Создаем ярлык на рабочем столе
console.log('\n📌 Создание ярлыка...');
if (process.platform === 'win32') {
  // Для Windows
  const desktop = require('os').homedir() + '\\Desktop';
  const shortcut = `CreateObject("WScript.Shell").CreateShortcut("${desktop}\\Constructor.lnk").TargetPath = "${process.cwd()}\\start.bat"`;
  fs.writeFileSync('create_shortcut.vbs', shortcut);
  execSync('cscript create_shortcut.vbs', { stdio: 'inherit' });
  fs.unlinkSync('create_shortcut.vbs');
}

console.log('\n✨ Готово!');
console.log('▶️ Запустите приложение командой: npm start');