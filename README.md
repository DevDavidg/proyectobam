# Proyecto BAM (estado actual del codigo)

Juego de estrategia/base-building isometrico en navegador, hecho con React + TypeScript y render 3D con Three.js (via React Three Fiber). La logica de juego vive separada del render y se persiste localmente.

## Que hace hoy el proyecto

- Construccion sobre grilla con preview, validaciones y modo mover edificio.
- Economia de recursos (twigs, pebbles, putty, goo) con ticks y capacidades.
- Combate base con enemigos, torres, proyectiles, impactos y resultados de batalla.
- Sistema de monstruos: hatchery, investigacion, pens, housing y army deck.
- Expansion de terreno, workers, HUD, context menu y modales de juego.

## Como esta organizado

- `core`: motor y reglas puras (grid, placement, tipos, catalogos).
- `state` (Zustand): estado global y acciones separadas por dominio.
- `ecs`: sincronizacion de entidades para simulacion/render.
- `render` (Three.js + R3F): escena, camara isometrica, terreno, mallas y efectos.
- `ui`: HUD, controles, shop y modales.
- `utils`: coordenadas y pathfinding.

## Stack actual

- React 19 + TypeScript 6
- Vite 8
- Three.js + `@react-three/fiber` + `@react-three/drei`
- `@react-three/postprocessing` + `postprocessing` (pipeline de efectos disponible)
- Zustand
- TailwindCSS 4

## Scripts

```bash
npm run dev              # entorno local
npm run build            # typecheck + build produccion
npm run preview          # preview del build
npm run download:assets  # descarga/procesa assets
```

## Arbol del proyecto (resumen)

```text
proyectobam/
├─ src/
│  ├─ main.tsx                              # entrypoint React
│  ├─ styles.css                            # estilos globales
│  ├─ app/
│  │  └─ App.tsx                            # layout principal + loop de ticks
│  ├─ core/
│  │  ├─ engine/game-engine.ts              # motor base (estado, dano, snapshots)
│  │  ├─ grid/grid.ts                       # creacion de grilla
│  │  ├─ grid/placement.ts                  # validacion de colocaciones
│  │  ├─ constants/*.ts                     # catalogos y reglas de balance
│  │  └─ types/*.ts                         # tipos de dominio
│  ├─ state/
│  │  ├─ game-store.ts                      # store global Zustand
│  │  ├─ game-store/combat-actions.ts       # acciones de combate
│  │  ├─ game-store/economy-actions.ts      # acciones de economia
│  │  ├─ game-store/monster-actions.ts      # hatchery/investigacion/army
│  │  ├─ game-store/placement-actions.ts    # placement/move/land
│  │  ├─ game-store/lifecycle-actions.ts    # init/sync/recalculos
│  │  └─ persistence.ts                     # persistencia local
│  ├─ ecs/
│  │  ├─ components/components.ts           # tipos ECS
│  │  ├─ systems/combat-tick-system.ts      # tick de combate
│  │  ├─ systems/resource-tick-system.ts    # tick de recursos
│  │  ├─ systems/preview-update-system.ts   # sincronizacion previews
│  │  ├─ systems/sync-grid-system.ts        # sync estado -> entidades
│  │  └─ world/world.ts                     # mundo ECS
│  ├─ render/
│  │  ├─ camera/isometric-camera.tsx        # camara isometrica
│  │  ├─ input/grid-pointer.tsx             # input/raycast sobre grilla
│  │  ├─ scene/game-canvas.tsx              # canvas de R3F
│  │  ├─ scene/game-scene.tsx               # escena principal 3D
│  │  ├─ scene/terrain.tsx                  # terreno procedural
│  │  ├─ scene/post-effects.tsx             # bloom/outline/contrast
│  │  ├─ scene/*.tsx                        # capas: workers, deploy, range, etc.
│  │  ├─ entities/BuildingVisual.tsx        # compositor de visuales de edificios
│  │  ├─ entities/hatchery-visual.tsx       # visual hatchery especializado
│  │  ├─ entities/building-visual/*         # cache geom, materiales, micro-props
│  │  ├─ entities/*.tsx                     # mallas de edificios, enemigos y previews
│  │  └─ fx/*.tsx                           # efectos (particulas/flujo)
│  ├─ ui/
│  │  ├─ hud/resource-hud.tsx               # HUD de recursos
│  │  ├─ controls/placement-controls.tsx    # controles de construccion
│  │  ├─ controls/army-deck.tsx             # deck de monstruos en batalla
│  │  ├─ controls/shop/building-icon.tsx    # iconografia de tienda
│  │  ├─ controls/shop/shop-item-card.tsx   # cards del shop
│  │  ├─ controls/shop/shop-cost-blocks.tsx # costos por recurso
│  │  ├─ controls/*.tsx                     # modales y controles auxiliares
│  │  └─ modals/monster-preview-canvas.tsx  # preview 3D en modal
│  └─ utils/
│     ├─ coordinates.ts                     # conversiones grid <-> mundo
│     └─ pathfinding.ts                     # utilidades de pathfinding
├─ scripts/
│  └─ download-assets.ts                    # descarga/procesamiento de assets
├─ public/                                  # assets publicos
├─ MANDATORYGUIDEPROJECT/                   # referencia externa (no runtime principal)
├─ package.json
└─ vite.config.ts
```

## Three.js: archivos clave

- `src/render/scene/game-canvas.tsx`: monta el `Canvas` de React Three Fiber.
- `src/render/scene/game-scene.tsx`: compone luces, terreno, capas y entidades.
- `src/render/scene/terrain.tsx`: crea el material procedural del suelo.
- `src/render/entities/BuildingVisual.tsx`: render por familia/tipo de edificio.
- `src/render/entities/hatchery-visual.tsx`: animaciones y VFX especificos de hatchery.
- `src/render/camera/isometric-camera.tsx`: setup de vista isometrica.
- `src/render/input/grid-pointer.tsx`: raycast para hover/placement sobre celdas.

## Flujo de ejecucion

1. `src/main.tsx` monta `App`.
2. `src/app/App.tsx` ejecuta ticks de juego y monta UI + canvas.
3. `src/state/game-store.ts` concentra estado/acciones y sincroniza con core/ecs.
4. `src/render/scene/game-scene.tsx` pinta el mundo 3D leyendo `state`.
5. `src/state/persistence.ts` guarda y restaura progreso local.

## Licencia

MIT.
