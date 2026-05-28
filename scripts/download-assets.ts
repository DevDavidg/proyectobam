// npm install adm-zip @types/adm-zip vite-node -D
import { copyFile, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AdmZip from 'adm-zip';

type AssetPack = {
  name: string;
  url: string;
};

const PROJECT_ROOT = process.cwd();
const TEMP_DIR = path.resolve(PROJECT_ROOT, '.tmp');
const TEMP_DOWNLOADS_DIR = path.join(TEMP_DIR, 'downloads');
const TEMP_EXTRACTED_DIR = path.join(TEMP_DIR, 'extracted');

const PUBLIC_ASSETS_DIR = path.resolve(PROJECT_ROOT, 'public', 'assets');
const MODELS_ROOT_DIR = path.join(PUBLIC_ASSETS_DIR, 'models');
const TEXTURES_ROOT_DIR = path.join(PUBLIC_ASSETS_DIR, 'textures');

const MODEL_EXTENSIONS = new Set(['.glb', '.gltf', '.obj', '.bin']);
const TEXTURE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

const assetPacks: AssetPack[] = [
  {
    name: 'gltf-sample-models',
    url: 'https://codeload.github.com/KhronosGroup/glTF-Sample-Models/zip/refs/heads/main',
  },
  {
    name: 'gltf-sample-assets',
    url: 'https://codeload.github.com/KhronosGroup/glTF-Sample-Assets/zip/refs/heads/main',
  },
  {
    name: 'gltf-sample-environments',
    url: 'https://codeload.github.com/KhronosGroup/glTF-Sample-Environments/zip/refs/heads/main',
  },
  {
    name: 'drei-assets',
    url: 'https://codeload.github.com/pmndrs/drei-assets/zip/refs/heads/master',
  },
];

const normalizePackName = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const ensureBaseDirectories = async (): Promise<void> => {
  await mkdir(MODELS_ROOT_DIR, { recursive: true });
  await mkdir(TEXTURES_ROOT_DIR, { recursive: true });
  await mkdir(TEMP_DOWNLOADS_DIR, { recursive: true });
  await mkdir(TEMP_EXTRACTED_DIR, { recursive: true });
};

const listFilesRecursively = async (directoryPath: string): Promise<string[]> => {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const filePaths = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        return listFilesRecursively(fullPath);
      }

      if (entry.isFile()) {
        return [fullPath];
      }

      return [];
    })
  );

  return filePaths.flat();
};

const downloadZipFile = async (url: string, outputPath: string): Promise<void> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} (${response.statusText}) al descargar ${url}`);
  }

  if (!response.body) {
    throw new Error(`La respuesta de red para ${url} no incluye body`);
  }

  const zipBuffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, zipBuffer);
};

const extractZip = async (zipPath: string, extractToDirectory: string): Promise<void> => {
  await mkdir(extractToDirectory, { recursive: true });
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractToDirectory, true);
};

const copyRelevantAssets = async (packFolderName: string, extractedRootPath: string): Promise<void> => {
  const files = await listFilesRecursively(extractedRootPath);

  for (const sourcePath of files) {
    const extension = path.extname(sourcePath).toLowerCase();
    const relativeSourcePath = path.relative(extractedRootPath, sourcePath);

    let destinationPath = '';
    if (MODEL_EXTENSIONS.has(extension)) {
      destinationPath = path.join(MODELS_ROOT_DIR, packFolderName, relativeSourcePath);
    } else if (TEXTURE_EXTENSIONS.has(extension)) {
      // Keep textures beside glTF files so relative URIs resolve at runtime.
      destinationPath = path.join(MODELS_ROOT_DIR, packFolderName, relativeSourcePath);
    } else {
      continue;
    }

    await mkdir(path.dirname(destinationPath), { recursive: true });
    console.log(`[Copiando archivo ${relativeSourcePath}...]`);
    await copyFile(sourcePath, destinationPath);
  }
};

const processAssetPack = async (pack: AssetPack): Promise<void> => {
  const packFolderName = normalizePackName(pack.name);
  if (!packFolderName) {
    throw new Error(`Nombre de pack inválido: "${pack.name}"`);
  }

  const zipFilePath = path.join(TEMP_DOWNLOADS_DIR, `${packFolderName}.zip`);
  const extractedPackPath = path.join(TEMP_EXTRACTED_DIR, packFolderName);

  console.log(`[Descargando Pack... ${pack.name}]`);
  await downloadZipFile(pack.url, zipFilePath);

  console.log(`[Descomprimiendo... ${pack.name}]`);
  await extractZip(zipFilePath, extractedPackPath);

  await copyRelevantAssets(packFolderName, extractedPackPath);
};

const cleanupTemporaryDirectory = async (): Promise<void> => {
  await rm(TEMP_DIR, { recursive: true, force: true });
  console.log('[Limpieza completada con éxito]');
};

export async function main(): Promise<void> {
  try {
    await ensureBaseDirectories();

    for (const pack of assetPacks) {
      try {
        await processAssetPack(pack);
      } catch (error) {
        console.error(`[Error procesando pack: ${pack.name}]`, error);
      }
    }
  } catch (error) {
    console.error('[Error general del script]', error);
    throw error;
  } finally {
    await cleanupTemporaryDirectory();
  }
}

main().catch((error) => {
  console.error('[Error fatal en ejecución]', error);
  process.exitCode = 1;
});
