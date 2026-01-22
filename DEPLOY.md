# 🚀 Desplegar en GitHub Pages

Esta guía te ayudará a desplegar la aplicación Marvel Tracker en GitHub Pages.

## Opción 1: Script Automático (Recomendado)

### Requisitos
- Git instalado
- Node.js 18+ instalado
- npm o pnpm instalado
- Acceso de push al repositorio

### Pasos

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/danielfu08/marvel-tracker.git
   cd marvel-tracker
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Ejecuta el script de deploy**
   ```bash
   ./deploy-gh-pages.sh
   ```

4. **Configura GitHub Pages** (una sola vez)
   - Ve a: https://github.com/danielfu08/marvel-tracker/settings/pages
   - En "Source", selecciona: **Deploy from a branch**
   - En "Branch", selecciona: **gh-pages** y **/root**
   - Haz clic en **Save**

5. **¡Listo!**
   Tu sitio estará disponible en: **https://danielfu08.github.io/marvel-tracker/**

## Opción 2: Manual

Si prefieres hacerlo manualmente:

```bash
# 1. Instala dependencias
npm install

# 2. Compila la aplicación
npm run build

# 3. Crea la rama gh-pages
git checkout --orphan gh-pages

# 4. Limpia el directorio
git rm -rf .

# 5. Copia los archivos compilados
cp -r dist/public/* .

# 6. Commit y push
git add .
git commit -m "Deploy to GitHub Pages"
git push -u origin gh-pages

# 7. Vuelve a main
git checkout main
```

## Actualizaciones Futuras

Cada vez que hagas cambios y quieras actualizar el sitio:

```bash
./deploy-gh-pages.sh
```

O manualmente:

```bash
npm run build
git checkout gh-pages
git pull origin gh-pages
rm -rf *
cp -r dist/public/* .
git add .
git commit -m "Update: $(date)"
git push origin gh-pages
git checkout main
```

## Solución de Problemas

### El sitio no se actualiza
- GitHub Pages puede tardar 5-10 minutos en procesar los cambios
- Limpia el caché del navegador (Ctrl+Shift+Del)
- Verifica que la rama `gh-pages` existe en GitHub

### Error de permisos
- Asegúrate de tener permisos de push en el repositorio
- Verifica que tu token de GitHub tiene permisos suficientes

### La URL es incorrecta
- Verifica que en `vite.config.ts` está: `base: '/marvel-tracker/'`
- Confirma que en GitHub Pages está configurado correctamente

## URLs

- **Repositorio:** https://github.com/danielfu08/marvel-tracker
- **Sitio en vivo:** https://danielfu08.github.io/marvel-tracker/

¡Disfruta tu Marvel Tracker! 🎬🍿
