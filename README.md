# Octabio App (prototipo)

Prototipo navegable mobile-first de la plataforma educativa STEAM **Octabio**: HTML + Tailwind CSS v4 + TypeScript (Vite), datos placeholder y mutaciones en `localStorage`.

## Cómo correr

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite (por defecto `http://localhost:5173`).

## Cuentas demo

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Estudiante | `estudiante@octabio.test` | `octabio` |
| Docente | `docente@octabio.test` | `octabio` |
| Administrador | `admin@octabio.test` | `octabio` |

También puedes registrarte como estudiante nuevo (queda guardado en `localStorage`).

## Reset demo

En **Mi perfil** usa el botón **Restablecer demo** para volver al seed inicial y cerrar sesión.

## Stack

- Vite + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide (iconos)
- Hash router (`#/...`)
- Estado en `localStorage`

## Alcance

Happy paths de Auth, Estudiante, Docente y Admin + estados críticos (login error, vacíos, acceso denegado). Ver [PENDING.md](./PENDING.md) para lo diferido.
