import { canPlaceBuilding } from '../grid/placement';
import { createGrid } from '../grid/grid';
import { BUILDING_TYPES } from '../types/building';
import type { Building } from '../types/building';
import type { GameState } from '../types/game-state';
import type { Enemy } from '../types/enemy';
import type { GameResources } from '../types/resources';

type PlaceBuildingInput = Omit<Building, 'id'> & { id?: string };

type PlacementPreview = {
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
  valid: boolean;
} | null;

type PersistedSnapshot = {
  resources?: GameResources;
  buildings?: Building[];
};

export class GameEngine {
  private readonly state: GameState;

  private placementPreview: PlacementPreview = null;

  public constructor(gridSize: number) {
    this.state = {
      gridSize,
      cells: createGrid(gridSize),
      buildings: [],
      enemies: [],
      resources: {
        twigs: { current: 500, max: 1000 },
        pebbles: { current: 500, max: 1000 },
        putty: { current: 200, max: 1000 },
        goo: { current: 100, max: 1000 },
      },
    };
  }

  public getState(): GameState {
    return {
      ...this.state,
      cells: this.state.cells.map((row) => row.map((cell) => ({ ...cell }))),
      buildings: this.state.buildings.map((building) => ({ ...building })),
      enemies: this.state.enemies.map((enemy) => ({ ...enemy })),
      resources: {
        twigs: { ...this.state.resources.twigs },
        pebbles: { ...this.state.resources.pebbles },
        putty: { ...this.state.resources.putty },
        goo: { ...this.state.resources.goo },
      },
    };
  }

  public getPlacementPreview(): PlacementPreview {
    if (!this.placementPreview) {
      return null;
    }

    return { ...this.placementPreview };
  }

  public setResources(resources: GameResources): void {
    this.state.resources = {
      twigs: { ...resources.twigs },
      pebbles: { ...resources.pebbles },
      putty: { ...resources.putty },
      goo: { ...resources.goo },
    };
  }

  public setEnemies(enemies: Enemy[]): void {
    this.state.enemies = enemies.map((enemy) => ({ ...enemy }));
  }

  public clearEnemies(): void {
    this.state.enemies = [];
  }

  public canPlaceAt(x: number, y: number, sizeX: number, sizeY: number): boolean {
    return canPlaceBuilding(this.state.cells, x, y, sizeX, sizeY);
  }

  public updatePlacementPreview(x: number, y: number, sizeX: number, sizeY: number): PlacementPreview {
    const valid = this.canPlaceAt(x, y, sizeX, sizeY);
    this.placementPreview = { x, y, sizeX, sizeY, valid };
    return { ...this.placementPreview };
  }

  public clearPlacementPreview(): void {
    this.placementPreview = null;
  }

  public placeBuilding(input: PlaceBuildingInput): Building | null {
    if (!this.canPlaceAt(input.x, input.y, input.sizeX, input.sizeY)) {
      return null;
    }

    const id = input.id ?? `${input.type.toLowerCase()}-${this.state.buildings.length + 1}`;
    const building: Building = {
      id,
      ...input,
    };

    for (let row = building.y; row < building.y + building.sizeY; row += 1) {
      for (let col = building.x; col < building.x + building.sizeX; col += 1) {
        this.state.cells[row][col].buildingId = building.id;
        this.state.cells[row][col].walkable = false;
      }
    }

    this.state.buildings.push(building);
    return { ...building };
  }

  public applyDamageToBuilding(buildingId: string, damage: number): Building | null {
    const buildingIndex = this.state.buildings.findIndex((building) => building.id === buildingId);
    if (buildingIndex === -1) {
      return null;
    }

    const building = this.state.buildings[buildingIndex];
    const nextHp = Math.max(0, building.hp - damage);
    this.state.buildings[buildingIndex] = {
      ...building,
      hp: nextHp,
    };

    if (nextHp > 0) {
      return { ...this.state.buildings[buildingIndex] };
    }
    if (building.type === BUILDING_TYPES.ARMY_HATCHERY) {
      this.state.buildings[buildingIndex] = {
        ...building,
        hp: 0,
      };
      return { ...this.state.buildings[buildingIndex] };
    }

    const removedBuilding = this.state.buildings.splice(buildingIndex, 1)[0];
    for (let row = removedBuilding.y; row < removedBuilding.y + removedBuilding.sizeY; row += 1) {
      for (let col = removedBuilding.x; col < removedBuilding.x + removedBuilding.sizeX; col += 1) {
        this.state.cells[row][col].buildingId = null;
        this.state.cells[row][col].walkable = true;
      }
    }

    return null;
  }

  public updateBuildingLastHarvested(buildingId: string, timestamp: number): void {
    const buildingIndex = this.state.buildings.findIndex((building) => building.id === buildingId);
    if (buildingIndex === -1) {
      return;
    }
    this.state.buildings[buildingIndex] = {
      ...this.state.buildings[buildingIndex],
      lastHarvested: timestamp,
    };
  }

  public updateBuilding(buildingId: string, updater: (building: Building) => Building): Building | null {
    const buildingIndex = this.state.buildings.findIndex((building) => building.id === buildingId);
    if (buildingIndex === -1) {
      return null;
    }
    const nextBuilding = updater(this.state.buildings[buildingIndex]);
    this.state.buildings[buildingIndex] = nextBuilding;
    return { ...nextBuilding };
  }

  public removeBuilding(buildingId: string): boolean {
    const buildingIndex = this.state.buildings.findIndex((building) => building.id === buildingId);
    if (buildingIndex === -1) {
      return false;
    }
    const removedBuilding = this.state.buildings.splice(buildingIndex, 1)[0];
    for (let row = removedBuilding.y; row < removedBuilding.y + removedBuilding.sizeY; row += 1) {
      for (let col = removedBuilding.x; col < removedBuilding.x + removedBuilding.sizeX; col += 1) {
        this.state.cells[row][col].buildingId = null;
        this.state.cells[row][col].walkable = true;
      }
    }
    return true;
  }

  public loadSnapshot(snapshot: PersistedSnapshot): void {
    this.state.cells = createGrid(this.state.gridSize);
    this.state.buildings = [];
    this.state.enemies = [];

    if (snapshot.resources) {
      this.setResources(snapshot.resources);
    }

    if (!snapshot.buildings?.length) {
      return;
    }

    for (const building of snapshot.buildings) {
      this.placeBuilding(building);
    }
  }
}
