#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# Upgrade Angular 18 -> 19 -> 20 -> 21
# Projeto: Angular + NG-ZORRO + ngx-mask + ngx-ui-loader
# ============================================================

echo "=============================================="
echo " Upgrade Angular 18 -> 21"
echo "=============================================="

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

if [ ! -f "package.json" ]; then
  echo "ERRO: package.json não encontrado."
  echo "Rode este script dentro da pasta do projeto Angular."
  exit 1
fi

echo ""
echo "Pasta atual:"
pwd

echo ""
echo "Verificando Node..."
node -v

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
NODE_MINOR="$(node -p "process.versions.node.split('.')[1]")"

if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "ERRO: Angular 21 precisa de Node >= 20.19.0."
  echo "Seu Node atual é: $(node -v)"
  exit 1
fi

if [ "$NODE_MAJOR" -eq 20 ] && [ "$NODE_MINOR" -lt 19 ]; then
  echo "ERRO: Angular 21 precisa de Node >= 20.19.0."
  echo "Seu Node atual é: $(node -v)"
  exit 1
fi

echo "Node OK."

echo ""
echo "Criando backup local..."
BACKUP_DIR=".angular-upgrade-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

cp package.json "$BACKUP_DIR/package.json.bak"

if [ -f "package-lock.json" ]; then
  cp package-lock.json "$BACKUP_DIR/package-lock.json.bak"
fi

if [ -f "angular.json" ]; then
  cp angular.json "$BACKUP_DIR/angular.json.bak"
fi

if [ -f "tsconfig.json" ]; then
  cp tsconfig.json "$BACKUP_DIR/tsconfig.json.bak"
fi

if [ -f "tsconfig.app.json" ]; then
  cp tsconfig.app.json "$BACKUP_DIR/tsconfig.app.json.bak"
fi

if [ -f "tsconfig.spec.json" ]; then
  cp tsconfig.spec.json "$BACKUP_DIR/tsconfig.spec.json.bak"
fi

echo "Backup salvo em: $BACKUP_DIR"

echo ""
echo "Status inicial do Angular:"
npx ng version || true

echo ""
echo "Criando branch de segurança, se estiver usando git..."
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  BRANCH_NAME="upgrade/angular-21-$(date +%Y%m%d-%H%M%S)"
  git switch -c "$BRANCH_NAME" || true
  echo "Branch atual:"
  git branch --show-current
else
  echo "Git não detectado. Continuando sem branch."
fi

clean_install() {
  echo ""
  echo "Limpando instalação antiga..."
  rm -rf node_modules package-lock.json

  echo ""
  echo "Instalando dependências..."
  npm install
}

build_project() {
  echo ""
  echo "Rodando build..."
  npm run build
}

show_versions() {
  echo ""
  echo "Versões Angular atuais no package.json:"
  node - <<'EOF'
const pkg = require('./package.json');

const deps = {
  ...pkg.dependencies,
  ...pkg.devDependencies
};

const names = [
  '@angular/core',
  '@angular/cli',
  '@angular/compiler-cli',
  '@angular-devkit/build-angular',
  '@angular/cdk',
  'ng-zorro-antd',
  'typescript',
  'zone.js',
  'rxjs',
  'ngx-mask',
  'ngx-ui-loader',
  'angular-eslint'
];

for (const name of names) {
  if (deps[name]) {
    console.log(`${name}: ${deps[name]}`);
  }
}
EOF
}

patch_tsconfig_target() {
  echo ""
  echo "Ajustando tsconfig para ES2022, se existir..."
  node - <<'EOF'
const fs = require('fs');

const files = [
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.spec.json'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  try {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));

    json.compilerOptions = json.compilerOptions || {};

    if (!json.compilerOptions.target || json.compilerOptions.target !== 'ES2022') {
      json.compilerOptions.target = 'ES2022';
    }

    fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
    console.log(`OK: ${file}`);
  } catch (err) {
    console.log(`Ignorando ${file}: não consegui parsear como JSON puro.`);
  }
}
EOF
}

patch_package_for_angular_19() {
  echo ""
  echo "Ajustando pacotes para Angular 19..."
  node - <<'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.dependencies = pkg.dependencies || {};
pkg.devDependencies = pkg.devDependencies || {};

const dep = pkg.dependencies;
const dev = pkg.devDependencies;

for (const name of [
  '@angular/animations',
  '@angular/common',
  '@angular/compiler',
  '@angular/core',
  '@angular/forms',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@angular/router'
]) {
  if (dep[name]) dep[name] = '^19.2.0';
}

if (dep['@angular/cdk']) dep['@angular/cdk'] = '^19.2.0';
if (dep['ng-zorro-antd']) dep['ng-zorro-antd'] = '^19.3.0';
if (dep['ngx-mask']) dep['ngx-mask'] = '^19.0.0';
if (dep['ngx-ui-loader']) dep['ngx-ui-loader'] = '^17.0.0';
if (dep['zone.js']) dep['zone.js'] = '~0.15.0';

if (dev['@angular-devkit/build-angular']) dev['@angular-devkit/build-angular'] = '^19.2.0';
if (dev['@angular/cli']) dev['@angular/cli'] = '^19.2.0';
if (dev['@angular/compiler-cli']) dev['@angular/compiler-cli'] = '^19.2.0';

for (const name of [
  '@angular-eslint/builder',
  '@angular-eslint/eslint-plugin',
  '@angular-eslint/eslint-plugin-template',
  '@angular-eslint/schematics'
]) {
  if (dev[name]) dev[name] = '^19.8.0';
}

if (dev['angular-eslint']) dev['angular-eslint'] = '^19.8.0';
dev['typescript'] = '~5.8.3';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
EOF
}

patch_package_for_angular_20() {
  echo ""
  echo "Ajustando pacotes para Angular 20..."
  node - <<'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.dependencies = pkg.dependencies || {};
pkg.devDependencies = pkg.devDependencies || {};

const dep = pkg.dependencies;
const dev = pkg.devDependencies;

for (const name of [
  '@angular/animations',
  '@angular/common',
  '@angular/compiler',
  '@angular/core',
  '@angular/forms',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@angular/router'
]) {
  if (dep[name]) dep[name] = '^20.3.0';
}

if (dep['@angular/cdk']) dep['@angular/cdk'] = '^20.2.0';
if (dep['ng-zorro-antd']) dep['ng-zorro-antd'] = '^20.2.0';
if (dep['ngx-mask']) dep['ngx-mask'] = '^20.0.0';
if (dep['ngx-ui-loader']) dep['ngx-ui-loader'] = '^18.0.0';
if (dep['zone.js']) dep['zone.js'] = '~0.15.0';

if (dev['@angular-devkit/build-angular']) dev['@angular-devkit/build-angular'] = '^20.3.0';
if (dev['@angular/cli']) dev['@angular/cli'] = '^20.3.0';
if (dev['@angular/compiler-cli']) dev['@angular/compiler-cli'] = '^20.3.0';

for (const name of [
  '@angular-eslint/builder',
  '@angular-eslint/eslint-plugin',
  '@angular-eslint/eslint-plugin-template',
  '@angular-eslint/schematics'
]) {
  if (dev[name]) dev[name] = '^20.4.0';
}

if (dev['angular-eslint']) dev['angular-eslint'] = '^20.4.0';
dev['typescript'] = '~5.8.3';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
EOF
}

patch_package_for_angular_21() {
  echo ""
  echo "Ajustando pacotes para Angular 21..."
  node - <<'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.dependencies = pkg.dependencies || {};
pkg.devDependencies = pkg.devDependencies || {};

const dep = pkg.dependencies;
const dev = pkg.devDependencies;

for (const name of [
  '@angular/animations',
  '@angular/common',
  '@angular/compiler',
  '@angular/core',
  '@angular/forms',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@angular/router'
]) {
  if (dep[name]) dep[name] = '^21.2.13';
}

if (dep['@angular/cdk']) dep['@angular/cdk'] = '^21.2.11';
if (dep['ng-zorro-antd']) dep['ng-zorro-antd'] = '^21.2.2';
if (dep['ngx-mask']) dep['ngx-mask'] = '^21.0.1';
if (dep['ngx-ui-loader']) dep['ngx-ui-loader'] = '^19.0.0';

dep['zone.js'] = '~0.16.0';

if (dev['@angular-devkit/build-angular']) dev['@angular-devkit/build-angular'] = '^21.2.11';
if (dev['@angular/cli']) dev['@angular/cli'] = '^21.2.11';
if (dev['@angular/compiler-cli']) dev['@angular/compiler-cli'] = '^21.2.13';

for (const name of [
  '@angular-eslint/builder',
  '@angular-eslint/eslint-plugin',
  '@angular-eslint/eslint-plugin-template',
  '@angular-eslint/schematics'
]) {
  if (dev[name]) dev[name] = '^21.4.0';
}

dev['angular-eslint'] = '21.4.0';
dev['typescript'] = '~5.9.3';

if (dev['typescript-eslint']) dev['typescript-eslint'] = '8.59.2';
if (dev['@typescript-eslint/eslint-plugin']) dev['@typescript-eslint/eslint-plugin'] = '^8.59.2';
if (dev['@typescript-eslint/parser']) dev['@typescript-eslint/parser'] = '^8.59.2';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
EOF
}

run_ng_update_major() {
  local VERSION="$1"

  echo ""
  echo "=============================================="
  echo " Atualizando Angular para v$VERSION"
  echo "=============================================="

  npx -p "@angular/cli@$VERSION" ng update "@angular/core@$VERSION" "@angular/cli@$VERSION" --allow-dirty

  show_versions
  clean_install
  patch_tsconfig_target
  build_project
}

echo ""
echo "=============================================="
echo " Etapa 0: instalação limpa inicial"
echo "=============================================="
clean_install
show_versions
build_project

echo ""
echo "=============================================="
echo " Etapa 1: Angular 18 -> 19"
echo "=============================================="
patch_package_for_angular_19
clean_install
npx -p @angular/cli@19 ng update @angular/core@19 @angular/cli@19 --allow-dirty
show_versions
clean_install
patch_tsconfig_target
build_project

echo ""
echo "=============================================="
echo " Etapa 2: Angular 19 -> 20"
echo "=============================================="
patch_package_for_angular_20
clean_install
npx -p @angular/cli@20 ng update @angular/core@20 @angular/cli@20 --allow-dirty
show_versions
clean_install
patch_tsconfig_target
build_project

echo ""
echo "=============================================="
echo " Etapa 3: Angular 20 -> 21"
echo "=============================================="
patch_package_for_angular_21
clean_install
npx -p @angular/cli@21 ng update @angular/core@21 @angular/cli@21 --allow-dirty
patch_package_for_angular_21
show_versions
clean_install
patch_tsconfig_target
build_project

echo ""
echo "=============================================="
echo " Instalação final do Angular CLI global v21"
echo "=============================================="
npm install -g @angular/cli@21 || true

echo ""
echo "=============================================="
echo " Resultado final"
echo "=============================================="

npx ng version || true

echo ""
echo "Rodando build final..."
npm run build

echo ""
echo "Finalizado."
echo ""
echo "Se quiser iniciar o projeto:"
echo "  npm start"
echo ""
echo "Ou:"
echo "  npx ng serve"
echo ""
echo "Backup salvo em:"
echo "  $BACKUP_DIR"
