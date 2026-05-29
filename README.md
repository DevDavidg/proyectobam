# Proyecto BAM

Juego de estrategia y base-building isométrico en navegador, inspirado en los clásicos de la era social gaming de los 2010s. Construido con TypeScript, WebGL (Three.js) y frameworks web modernos, sin motores comerciales pesados.

La lógica de juego vive separada del render y el progreso se persiste localmente (local-first).

## Qué hace hoy el proyecto

- Construcción sobre grilla con preview, validaciones y modo mover edificio.
- Economía de recursos (twigs, pebbles, putty, goo) con ticks, capacidades y recolección visual.
- Combate base con enemigos, torres, proyectiles, impactos y resultados de batalla.
- Sistema de monstruos: hatchery, investigación, pens, housing, army deck y monster academy.
- Expansión de terreno, workers animados, HUD, context menu modular y modales de juego.
- Visuales 3D procedurales por edificio (sin sprites estáticos para los collectors principales).

## Cómo está organizado

| Capa | Responsabilidad |
|------|-----------------|
| `core` | Motor y reglas puras: grid, placement, tipos, catálogos y balance |
| `state` (Zustand) | Estado global y acciones separadas por dominio |
| `ecs` | Sincronización de entidades para simulación/render |
| `render` (Three.js + R3F) | Escena, cámara isométrica, terreno, mallas y efectos |
| `ui` | HUD, controles, shop y modales |
| `utils` | Coordenadas y pathfinding |

## Stack

- React 19 + TypeScript 6
- Vite 8
- Three.js + `@react-three/fiber` + `@react-three/drei`
- `@react-three/postprocessing` + `postprocessing`
- Zustand
- TailwindCSS 4
- bitecs / miniplex (ECS)

## Scripts

```bash
npm run dev              # entorno local
npm run build            # typecheck + build produccion
npm run preview          # preview del build
npm run download:assets  # descarga/procesa assets
```

## Árbol del proyecto (resumen)

```text
proyectobam/
├─ src/
│  ├─ main.tsx
│  ├─ styles.css
│  ├─ app/App.tsx                           # layout principal + loop de ticks
│  ├─ core/
│  │  ├─ engine/game-engine.ts
│  │  ├─ grid/grid.ts, placement.ts
│  │  ├─ constants/
│  │  │  ├─ catalog.ts, build-rules.ts
│  │  │  ├─ goo-factory-catalog.ts
│  │  │  ├─ pebble-shiner-catalog.ts
│  │  │  ├─ putty-squisher-catalog.ts
│  │  │  ├─ twig-snapper-catalog.ts
│  │  │  ├─ monster-academy-catalog.ts
│  │  │  └─ *.ts                            # torres, silos, monstruos
│  │  └─ types/
│  ├─ state/
│  │  ├─ game-store.ts
│  │  ├─ game-store/combat-actions.ts
│  │  ├─ game-store/economy-actions.ts
│  │  ├─ game-store/monster-actions.ts
│  │  ├─ game-store/placement-actions.ts
│  │  ├─ game-store/lifecycle-actions.ts
│  │  └─ persistence.ts
│  ├─ ecs/
│  │  ├─ components/, systems/, world/
│  ├─ render/
│  │  ├─ camera/isometric-camera.tsx
│  │  ├─ input/grid-pointer.tsx
│  │  ├─ scene/
│  │  │  ├─ game-canvas.tsx, game-scene.tsx
│  │  │  ├─ terrain.tsx, post-effects.tsx
│  │  │  ├─ workers-layer.tsx, resource-collection-layer.tsx
│  │  │  └─ building-context-menu/          # menu contextual modular
│  │  ├─ entities/
│  │  │  ├─ BuildingVisual.tsx              # compositor por familia/tipo
│  │  │  ├─ building-visual/                 # materiales, cache geom, helpers
│  │  │  ├─ shared/                         # utilidades reutilizables entre visuales
│  │  │  │  ├─ math.ts                      # clamp01, lerp, easeInOut, stagedProgress
│  │  │  │  ├─ building-visual-state.ts     # estados HP/daño compartidos
│  │  │  │  ├─ tier-scale.ts                # escalas por nivel
│  │  │  │  ├─ types.ts                     # MaterialToken, MaterialFactory
│  │  │  │  ├─ ground-decal.tsx             # círculo de suelo
│  │  │  │  ├─ grass-tuft-cluster.tsx       # hierba decorativa
│  │  │  │  └─ damage-debris-group.tsx      # wrappers de overlays de daño
│  │  │  ├─ goo-factory-visual/             # fábrica de goo (modular)
│  │  │  ├─ pebble-shiner-visual/           # pulidor de piedras
│  │  │  ├─ putty-squisher-visual/          # prensa de putty
│  │  │  ├─ twig-snapper-visual/            # triturador de twigs
│  │  │  ├─ town-hall-visual/               # ayuntamiento procedural
│  │  │  ├─ hatchery-visual.tsx
│  │  │  └─ *.tsx                           # torres, enemigos, previews
│  │  └─ fx/
│  ├─ ui/
│  │  ├─ hud/resource-hud.tsx
│  │  ├─ controls/placement-controls.tsx
│  │  ├─ controls/shop/
│  │  └─ modals/
│  └─ utils/coordinates.ts, pathfinding.ts
├─ scripts/download-assets.ts
├─ public/
└─ vite.config.ts
```

## Visuales de edificios (`render/entities`)

Los collectors y el town hall usan módulos propios con esta estructura:

```text
*-visual/
├─ index.tsx          # composición principal + animaciones
├─ geometry.ts        # dimensiones y datos procedurales
├─ palette.ts         # colores del edificio
├─ helpers.ts         # lógica específica (reusa shared/)
├─ types.ts           # props y dimensiones tipadas
└─ parts/             # sub-componentes (tank, daño, decoración, etc.)
```

La capa `shared/` concentra lo que se repetía entre visuales:

- **Estado visual por HP** (`resolveHpVisualState`): destroyed / damaged / in-action / normal.
- **Escalas por tier** (`resolveTierScaleFromTable`): tablas por edificio.
- **Matemática de animación** (`clamp01`, `easeInOut`, `stagedProgress`).
- **Componentes R3F** reutilizables: `GroundDecal`, `GrassTuftCluster`, `DamagedDebrisGroup`.

`BuildingVisual.tsx` enruta cada tipo de edificio al visual correspondiente e inyecta `createMaterial` desde `building-visual/materials.tsx`.

## Three.js: archivos clave

- `src/render/scene/game-canvas.tsx` — monta el `Canvas` de React Three Fiber.
- `src/render/scene/game-scene.tsx` — compone luces, terreno, capas y entidades.
- `src/render/scene/terrain.tsx` — material procedural del suelo.
- `src/render/entities/BuildingVisual.tsx` — render por familia/tipo de edificio.
- `src/render/entities/building-context-menu/` — acciones, detalle y recolección.
- `src/render/camera/isometric-camera.tsx` — vista isométrica.
- `src/render/input/grid-pointer.tsx` — raycast para hover/placement.

## Flujo de ejecución

1. `src/main.tsx` monta `App`.
2. `src/app/App.tsx` ejecuta ticks de juego y monta UI + canvas.
3. `src/state/game-store.ts` concentra estado/acciones y sincroniza con core/ecs.
4. `src/render/scene/game-scene.tsx` pinta el mundo 3D leyendo `state`.
5. `src/state/persistence.ts` guarda y restaura progreso local.

## Licencia

MIT.
