# Guía para compilar y subir a Game Jolt (Rama traditional-build)

Esta rama está configurada para compilar el juego en formato HTML tradicional (sin módulos ES, sin problemas de CORS locales y optimizado para el sandbox de Game Jolt).

## Requisitos
Para generar el archivo ZIP compatible y sin errores de barras invertidas (`\`) en Windows, debes utilizar la herramienta `tar` (incluida en Windows 10/11) en lugar del compresor nativo de PowerShell o de Windows.

## Instrucciones paso a paso para compilar y empaquetar

1. **Compilar el proyecto:**
   Genera los archivos estáticos en la carpeta `dist`. Este comando compila el código e inyecta el script deferido tradicional usando `postbuild.js`.
   ```bash
   npm run build
   ```

2. **Generar el archivo ZIP:**
   Entra a la carpeta `dist` y usa `tar` para comprimir los archivos con barras diagonales `/` (compatibles con servidores Unix/Linux de Game Jolt):
   ```powershell
   cd dist
   tar -a -c -f ../game-dist.zip *
   cd ..
   ```
   *Nota: No uses `Compress-Archive` de PowerShell, ya que inserta barras invertidas (`\`) que causan errores 404 en el servidor web de Game Jolt.*

3. **Subir a Game Jolt:**
   Sube el archivo `game-dist.zip` generado en la raíz del proyecto en la opción **Upload Browser Build** dentro del panel de administración de tu juego en Game Jolt.
