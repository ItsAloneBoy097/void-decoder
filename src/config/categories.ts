import {
  Map,
  Wrench,
  Cuboid,
  Server,
  FileCode,
  Box,
  Palette,
  Sparkles,
  Package,
  Globe,
  Command,
  Layers,
  ScrollText,
  Gift,
  BookOpen,
  Trophy,
  type LucideIcon
} from 'lucide-react';

export interface CategoryField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'file' | 'toggle';
  required: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
}

export interface CategoryConfig {
  id: string;
  label: string;
  slug: string;
  icon: LucideIcon;
  description: string;
  color: string; // HSL values
  fields: CategoryField[];
  cardLayout: 'standard' | 'compact' | 'wide' | 'gallery';
  metadataDisplay: string[]; // Which fields to show on cards
  supportsVersioning: boolean;
  supportsEditions: boolean; // Java, Bedrock, Education
  fileTypes: string[]; // Allowed file extensions
  maxFileSize: number; // In MB
  requiresScreenshots: boolean;
  minScreenshots?: number;
  maxScreenshots?: number;
}

export const MINECRAFT_EDITIONS = [
  { id: 'java', label: 'Java Edition' },
  { id: 'bedrock', label: 'Bedrock Edition' },
  { id: 'education', label: 'Education Edition' }
];

export const CATEGORIES: Record<string, CategoryConfig> = {
  maps: {
    id: 'maps',
    label: 'Maps',
    slug: 'maps',
    icon: Map,
    description: 'Adventure, survival, and custom Minecraft maps',
    color: '188 100% 50%',
    cardLayout: 'wide',
    metadataDisplay: ['dimensions', 'playerCount', 'gameMode'],
    supportsVersioning: true,
    supportsEditions: true,
    fileTypes: ['.zip', '.rar', '.mcworld'],
    maxFileSize: 500,
    requiresScreenshots: true,
    minScreenshots: 3,
    maxScreenshots: 10,
    fields: [
      { name: 'dimensions', label: 'Map Dimensions', type: 'text', required: true, placeholder: '1000x1000' },
      { name: 'gameMode', label: 'Game Mode', type: 'select', required: true, options: ['Adventure', 'Survival', 'Creative', 'Parkour', 'PvP', 'Puzzle'] },
      { name: 'playerCount', label: 'Player Count', type: 'text', required: true, placeholder: '1-4 players' },
      { name: 'difficulty', label: 'Difficulty', type: 'select', required: false, options: ['Easy', 'Medium', 'Hard', 'Expert'] },
      { name: 'estimatedPlaytime', label: 'Estimated Playtime', type: 'text', required: false, placeholder: '2-3 hours' },
    ]
  },

  plugins: {
    id: 'plugins',
    label: 'Plugins',
    slug: 'plugins',
    icon: Wrench,
    description: 'Server plugins for Bukkit, Spigot, Paper, and more',
    color: '45 100% 51%',
    cardLayout: 'standard',
    metadataDisplay: ['serverSoftware', 'dependencies'],
    supportsVersioning: true,
    supportsEditions: false,
    fileTypes: ['.jar'],
    maxFileSize: 50,
    requiresScreenshots: false,
    fields: [
      { name: 'serverSoftware', label: 'Server Software', type: 'multiselect', required: true, options: ['Bukkit', 'Spigot', 'Paper', 'Purpur', 'Fabric', 'Forge'] },
      { name: 'dependencies', label: 'Dependencies', type: 'textarea', required: false, placeholder: 'List required plugins' },
      { name: 'commands', label: 'Commands', type: 'textarea', required: false, placeholder: 'List available commands' },
      { name: 'permissions', label: 'Permissions', type: 'textarea', required: false, placeholder: 'List permission nodes' },
    ]
  },

  schematics: {
    id: 'schematics',
    label: 'Schematics',
    slug: 'schematics',
    icon: Cuboid,
    description: 'WorldEdit schematics and structure files',
    color: '270 100% 65%',
    cardLayout: 'gallery',
    metadataDisplay: ['dimensions', 'blockCount'],
    supportsVersioning: true,
    supportsEditions: true,
    fileTypes: ['.schem', '.schematic', '.nbt'],
    maxFileSize: 100,
    requiresScreenshots: true,
    minScreenshots: 2,
    maxScreenshots: 5,
    fields: [
      { name: 'dimensions', label: 'Dimensions', type: 'text', required: true, placeholder: '50x30x50' },
      { name: 'blockCount', label: 'Approximate Block Count', type: 'number', required: false },
      { name: 'buildType', label: 'Build Type', type: 'select', required: true, options: ['House', 'Castle', 'Modern', 'Fantasy', 'Redstone', 'Decoration', 'Other'] },
    ]
  },

  server_setups: {
    id: 'server_setups',
    label: 'Server Setups',
    slug: 'server-setups',
    icon: Server,
    description: 'Complete server configurations and setups',
    color: '120 100% 40%',
    cardLayout: 'standard',
    metadataDisplay: ['serverType', 'playerCapacity'],
    supportsVersioning: true,
    supportsEditions: false,
    fileTypes: ['.zip', '.rar', '.tar.gz'],
    maxFileSize: 1000,
    requiresScreenshots: true,
    minScreenshots: 2,
    maxScreenshots: 8,
    fields: [
      { name: 'serverType', label: 'Server Type', type: 'select', required: true, options: ['Survival', 'Creative', 'Mini-games', 'RPG', 'Skyblock', 'Prison', 'Factions'] },
      { name: 'playerCapacity', label: 'Player Capacity', type: 'number', required: true },
      { name: 'includedPlugins', label: 'Included Plugins', type: 'textarea', required: false },
      { name: 'setupGuide', label: 'Setup Instructions', type: 'textarea', required: true },
    ]
  },

  plugin_configs: {
    id: 'plugin_configs',
    label: 'Plugin Configs',
    slug: 'plugin-configs',
    icon: FileCode,
    description: 'Pre-configured plugin configuration files',
    color: '30 100% 50%',
    cardLayout: 'compact',
    metadataDisplay: ['pluginName', 'configType'],
    supportsVersioning: true,
    supportsEditions: false,
    fileTypes: ['.yml', '.yaml', '.json', '.conf', '.zip'],
    maxFileSize: 10,
    requiresScreenshots: false,
    fields: [
      { name: 'pluginName', label: 'Plugin Name', type: 'text', required: true },
      { name: 'configType', label: 'Configuration Type', type: 'select', required: true, options: ['Main Config', 'Messages', 'Permissions', 'Database', 'Complete Pack'] },
      { name: 'features', label: 'Features Configured', type: 'textarea', required: true },
    ]
  },

  resource_packs: {
    id: 'resource_packs',
    label: 'Resource Packs',
    slug: 'resource-packs',
    icon: Box,
    description: 'Complete resource packs with textures, sounds, and models',
    color: '340 100% 50%',
    cardLayout: 'wide',
    metadataDisplay: ['resolution', 'packFormat'],
    supportsVersioning: true,
    supportsEditions: true,
    fileTypes: ['.zip', '.mcpack'],
    maxFileSize: 200,
    requiresScreenshots: true,
    minScreenshots: 5,
    maxScreenshots: 15,
    fields: [
      { name: 'resolution', label: 'Resolution', type: 'select', required: true, options: ['16x', '32x', '64x', '128x', '256x', '512x', '1024x'] },
      { name: 'packFormat', label: 'Pack Format', type: 'number', required: true },
      { name: 'style', label: 'Art Style', type: 'select', required: true, options: ['Realistic', 'Cartoon', 'Medieval', 'Futuristic', 'Fantasy', 'Pixel', 'Painterly'] },
      { name: 'features', label: 'Features', type: 'multiselect', required: true, options: ['Textures', 'Models', 'Sounds', 'Music', 'GUI', 'Particles', 'Fonts'] },
    ]
  },

  texture_packs: {
    id: 'texture_packs',
    label: 'Texture Packs',
    slug: 'texture-packs',
    icon: Palette,
    description: 'Texture-only packs for blocks and items',
    color: '280 100% 60%',
    cardLayout: 'gallery',
    metadataDisplay: ['resolution', 'textureType'],
    supportsVersioning: true,
    supportsEditions: true,
    fileTypes: ['.zip', '.mcpack'],
    maxFileSize: 150,
    requiresScreenshots: true,
    minScreenshots: 4,
    maxScreenshots: 12,
    fields: [
      { name: 'resolution', label: 'Resolution', type: 'select', required: true, options: ['16x', '32x', '64x', '128x', '256x', '512x'] },
      { name: 'textureType', label: 'Texture Type', type: 'select', required: true, options: ['Blocks', 'Items', 'Both', 'GUI', 'Terrain'] },
      { name: 'style', label: 'Style', type: 'text', required: true },
    ]
  },

  shaders: {
    id: 'shaders',
    label: 'Shaders',
    slug: 'shaders',
    icon: Sparkles,
    description: 'Shader packs for enhanced graphics and lighting',
    color: '200 100% 50%',
    cardLayout: 'wide',
    metadataDisplay: ['shaderLoader', 'performanceImpact'],
    supportsVersioning: true,
    supportsEditions: false,
    fileTypes: ['.zip'],
    maxFileSize: 100,
    requiresScreenshots: true,
    minScreenshots: 5,
    maxScreenshots: 15,
    fields: [
      { name: 'shaderLoader', label: 'Shader Loader', type: 'multiselect', required: true, options: ['OptiFine', 'Iris', 'Canvas'] },
      { name: 'performanceImpact', label: 'Performance Impact', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Very High'] },
      { name: 'features', label: 'Features', type: 'multiselect', required: true, options: ['Shadows', 'Water Reflections', 'Ambient Occlusion', 'Bloom', 'Motion Blur', 'Volumetric Fog', 'Ray Tracing'] },
      { name: 'recommendedSpecs', label: 'Recommended Specs', type: 'textarea', required: false },
    ]
  },

  skins: {
    id: 'skins',
    label: 'Skins',
    slug: 'skins',
    icon: Palette,
    description: 'Player skins and character models',
    color: '330 100% 55%',
    cardLayout: 'gallery',
    metadataDisplay: ['skinType', 'modelType'],
    supportsVersioning: false,
    supportsEditions: true,
    fileTypes: ['.png'],
    maxFileSize: 5,
    requiresScreenshots: true,
    minScreenshots: 1,
    maxScreenshots: 4,
    fields: [
      { name: 'skinType', label: 'Skin Type', type: 'select', required: true, options: ['Character', 'Mob', 'Fantasy', 'Realistic', 'Anime', 'Cartoon'] },
      { name: 'modelType', label: 'Model Type', type: 'select', required: true, options: ['Classic (Steve)', 'Slim (Alex)'] },
    ]
  },

  mods: {
    id: 'mods',
    label: 'Mods',
    slug: 'mods',
    icon: Package,
    description: 'Minecraft mods for Forge, Fabric, and more',
    color: '140 100% 45%',
    cardLayout: 'standard',
    metadataDisplay: ['modLoader', 'dependencies'],
    supportsVersioning: true,
    supportsEditions: false,
    fileTypes: ['.jar'],
    maxFileSize: 100,
    requiresScreenshots: true,
    minScreenshots: 3,
    maxScreenshots: 10,
    fields: [
      { name: 'modLoader', label: 'Mod Loader', type: 'multiselect', required: true, options: ['Forge', 'Fabric', 'Quilt', 'NeoForge'] },
      { name: 'dependencies', label: 'Dependencies', type: 'textarea', required: false, placeholder: 'List required mods' },
      { name: 'modType', label: 'Mod Type', type: 'select', required: true, options: ['Technology', 'Magic', 'Adventure', 'World Generation', 'Automation', 'Decoration', 'QoL', 'Performance'] },
      { name: 'sideSupport', label: 'Side Support', type: 'select', required: true, options: ['Client & Server', 'Client Only', 'Server Only'] },
    ]
  },

  modpacks: {
    id: 'modpacks',
    label: 'Modpacks',
    slug: 'modpacks',
    icon: Box,
    description: 'Curated collections of mods',
    color: '260 100% 55%',
    cardLayout: 'wide',
    metadataDisplay: ['modCount', 'packType', 'modLoader'],
    supportsVersioning: true,
    supportsEditions: false,
    fileTypes: ['.zip', '.mrpack'],
    maxFileSize: 500,
    requiresScreenshots: true,
    minScreenshots: 5,
    maxScreenshots: 15,
    fields: [
      { name: 'modLoader', label: 'Mod Loader', type: 'select', required: true, options: ['Forge', 'Fabric', 'Quilt', 'NeoForge'] },
      { name: 'modCount', label: 'Number of Mods', type: 'number', required: true },
      { name: 'packType', label: 'Pack Type', type: 'select', required: true, options: ['Tech', 'Magic', 'Adventure', 'Quest', 'Hardcore', 'Lite', 'Kitchen Sink'] },
      { name: 'ramRequirement', label: 'RAM Requirement', type: 'text', required: true, placeholder: '4-6 GB' },
    ]
  },

  scripts: {
    id: 'scripts',
    label: 'Scripts',
    slug: 'scripts',
    icon: FileCode,
    description: 'Skript scripts and command block creations',
    color: '60 100% 50%',
    cardLayout: 'compact',
    metadataDisplay: ['scriptType', 'dependencies'],
    supportsVersioning: true,
    supportsEditions: false,
    fileTypes: ['.sk', '.txt', '.zip'],
    maxFileSize: 10,
    requiresScreenshots: false,
    fields: [
      { name: 'scriptType', label: 'Script Type', type: 'select', required: true, options: ['Skript', 'denizen', 'JavaScript', 'Python'] },
      { name: 'dependencies', label: 'Required Plugins', type: 'textarea', required: false },
      { name: 'features', label: 'Features', type: 'textarea', required: true },
    ]
  },

  commands: {
    id: 'commands',
    label: 'Commands',
    slug: 'commands',
    icon: Command,
    description: 'Command block creations and one-command installations',
    color: '20 100% 50%',
    cardLayout: 'compact',
    metadataDisplay: ['commandType', 'complexity'],
    supportsVersioning: true,
    supportsEditions: false,
    fileTypes: ['.txt', '.mcfunction'],
    maxFileSize: 5,
    requiresScreenshots: true,
    minScreenshots: 1,
    maxScreenshots: 5,
    fields: [
      { name: 'commandType', label: 'Command Type', type: 'select', required: true, options: ['One Command', 'Multiple Commands', 'Function'] },
      { name: 'complexity', label: 'Complexity', type: 'select', required: true, options: ['Simple', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'usage', label: 'Usage Instructions', type: 'textarea', required: true },
    ]
  },

  worlds: {
    id: 'worlds',
    label: 'Worlds',
    slug: 'worlds',
    icon: Globe,
    description: 'Custom generated worlds and terrain',
    color: '100 100% 45%',
    cardLayout: 'wide',
    metadataDisplay: ['worldType', 'spawnBiome'],
    supportsVersioning: true,
    supportsEditions: true,
    fileTypes: ['.zip', '.mcworld'],
    maxFileSize: 1000,
    requiresScreenshots: true,
    minScreenshots: 4,
    maxScreenshots: 12,
    fields: [
      { name: 'worldType', label: 'World Type', type: 'select', required: true, options: ['Survival', 'Creative', 'Adventure', 'Custom Terrain', 'Skyblock', 'Void'] },
      { name: 'spawnBiome', label: 'Spawn Biome', type: 'text', required: false },
      { name: 'generatorSettings', label: 'Generator Settings', type: 'textarea', required: false },
      { name: 'structures', label: 'Special Structures', type: 'textarea', required: false },
    ]
  },

  seeds: {
    id: 'seeds',
    label: 'Seeds',
    slug: 'seeds',
    icon: Globe,
    description: 'Interesting world seeds with unique features',
    color: '85 100% 40%',
    cardLayout: 'standard',
    metadataDisplay: ['seedValue', 'notableFeatures'],
    supportsVersioning: true,
    supportsEditions: true,
    fileTypes: [], // Seeds are just text
    maxFileSize: 0,
    requiresScreenshots: true,
    minScreenshots: 3,
    maxScreenshots: 8,
    fields: [
      { name: 'seedValue', label: 'Seed Value', type: 'text', required: true, placeholder: 'Enter seed number or text' },
      { name: 'spawnCoordinates', label: 'Spawn Coordinates', type: 'text', required: false, placeholder: 'X: 0, Y: 64, Z: 0' },
      { name: 'notableFeatures', label: 'Notable Features', type: 'textarea', required: true, placeholder: 'Describe interesting locations and coordinates' },
      { name: 'biomes', label: 'Nearby Biomes', type: 'textarea', required: false },
    ]
  },

  custom_items: {
    id: 'custom_items',
    label: 'Custom Items',
    slug: 'custom-items',
    icon: Gift,
    description: 'Custom items, weapons, and tools',
    color: '310 100% 55%',
    cardLayout: 'gallery',
    metadataDisplay: ['itemType', 'implementationType'],
    supportsVersioning: true,
    supportsEditions: true,
    fileTypes: ['.zip', '.mcfunction', '.json'],
    maxFileSize: 50,
    requiresScreenshots: true,
    minScreenshots: 2,
    maxScreenshots: 6,
    fields: [
      { name: 'itemType', label: 'Item Type', type: 'select', required: true, options: ['Weapon', 'Tool', 'Armor', 'Food', 'Potion', 'Block', 'Decoration', 'Other'] },
      { name: 'implementationType', label: 'Implementation', type: 'select', required: true, options: ['Command', 'Datapack', 'Plugin', 'Mod'] },
      { name: 'abilities', label: 'Special Abilities', type: 'textarea', required: false },
    ]
  },

  datapacks: {
    id: 'datapacks',
    label: 'Datapacks',
    slug: 'datapacks',
    icon: Layers,
    description: 'Vanilla datapacks for custom game mechanics',
    color: '160 100% 45%',
    cardLayout: 'standard',
    metadataDisplay: ['datapackType', 'features'],
    supportsVersioning: true,
    supportsEditions: false,
    fileTypes: ['.zip'],
    maxFileSize: 50,
    requiresScreenshots: true,
    minScreenshots: 2,
    maxScreenshots: 8,
    fields: [
      { name: 'datapackType', label: 'Datapack Type', type: 'select', required: true, options: ['Gameplay', 'Crafting', 'Loot', 'World Generation', 'Advancement', 'Quality of Life'] },
      { name: 'features', label: 'Features Added', type: 'textarea', required: true },
      { name: 'conflicts', label: 'Known Conflicts', type: 'textarea', required: false },
    ]
  },

  advancements: {
    id: 'advancements',
    label: 'Advancements',
    slug: 'advancements',
    icon: Trophy,
    description: 'Custom achievement and advancement packs',
    color: '40 100% 50%',
    cardLayout: 'compact',
    metadataDisplay: ['advancementCount', 'category'],
    supportsVersioning: true,
    supportsEditions: false,
    fileTypes: ['.zip', '.json'],
    maxFileSize: 10,
    requiresScreenshots: true,
    minScreenshots: 1,
    maxScreenshots: 5,
    fields: [
      { name: 'advancementCount', label: 'Number of Advancements', type: 'number', required: true },
      { name: 'category', label: 'Category', type: 'select', required: true, options: ['Vanilla+', 'Challenge', 'Story', 'Technical', 'Humor'] },
      { name: 'difficulty', label: 'Overall Difficulty', type: 'select', required: true, options: ['Easy', 'Medium', 'Hard', 'Extreme'] },
    ]
  },

  loot_tables: {
    id: 'loot_tables',
    label: 'Loot Tables',
    slug: 'loot-tables',
    icon: ScrollText,
    description: 'Custom loot table configurations',
    color: '180 100% 45%',
    cardLayout: 'compact',
    metadataDisplay: ['lootType', 'balance'],
    supportsVersioning: true,
    supportsEditions: false,
    fileTypes: ['.zip', '.json'],
    maxFileSize: 10,
    requiresScreenshots: false,
    fields: [
      { name: 'lootType', label: 'Loot Type', type: 'multiselect', required: true, options: ['Mobs', 'Chests', 'Fishing', 'Mining', 'Trading'] },
      { name: 'balance', label: 'Balance Type', type: 'select', required: true, options: ['Vanilla+', 'Balanced', 'Harder', 'Easier', 'Overpowered'] },
      { name: 'description', label: 'Changes Made', type: 'textarea', required: true },
    ]
  },

  recipes: {
    id: 'recipes',
    label: 'Recipes',
    slug: 'recipes',
    icon: BookOpen,
    description: 'Custom crafting and smelting recipes',
    color: '220 100% 50%',
    cardLayout: 'compact',
    metadataDisplay: ['recipeCount', 'recipeType'],
    supportsVersioning: true,
    supportsEditions: false,
    fileTypes: ['.zip', '.json'],
    maxFileSize: 10,
    requiresScreenshots: true,
    minScreenshots: 1,
    maxScreenshots: 8,
    fields: [
      { name: 'recipeCount', label: 'Number of Recipes', type: 'number', required: true },
      { name: 'recipeType', label: 'Recipe Types', type: 'multiselect', required: true, options: ['Crafting', 'Smelting', 'Smoking', 'Blasting', 'Smithing', 'Stonecutting'] },
      { name: 'features', label: 'Featured Recipes', type: 'textarea', required: true },
    ]
  },

  builds: {
    id: 'builds',
    label: 'Builds',
    slug: 'builds',
    icon: Cuboid,
    description: 'Showcased builds and constructions',
    color: '300 100% 50%',
    cardLayout: 'wide',
    metadataDisplay: ['buildStyle', 'dimensions'],
    supportsVersioning: true,
    supportsEditions: true,
    fileTypes: ['.schem', '.schematic', '.zip', '.mcworld'],
    maxFileSize: 200,
    requiresScreenshots: true,
    minScreenshots: 4,
    maxScreenshots: 15,
    fields: [
      { name: 'buildStyle', label: 'Build Style', type: 'select', required: true, options: ['Medieval', 'Modern', 'Fantasy', 'Futuristic', 'Organic', 'Redstone', 'Steampunk', 'Asian'] },
      { name: 'dimensions', label: 'Approximate Dimensions', type: 'text', required: false, placeholder: '100x50x80' },
      { name: 'buildTime', label: 'Build Time', type: 'text', required: false, placeholder: '20 hours' },
      { name: 'interiorFurnished', label: 'Interior Furnished', type: 'toggle', required: false },
    ]
  },

  servers: {
    id: 'servers',
    label: 'Servers',
    slug: 'servers',
    icon: Server,
    description: 'Public Minecraft servers',
    color: '0 100% 50%',
    cardLayout: 'standard',
    metadataDisplay: ['serverIP', 'gameType', 'playerCount'],
    supportsVersioning: true,
    supportsEditions: true,
    fileTypes: [], // Servers don't have files
    maxFileSize: 0,
    requiresScreenshots: true,
    minScreenshots: 3,
    maxScreenshots: 10,
    fields: [
      { name: 'serverIP', label: 'Server IP/Address', type: 'text', required: true, placeholder: 'play.example.com' },
      { name: 'gameType', label: 'Game Type', type: 'multiselect', required: true, options: ['Survival', 'Creative', 'Skyblock', 'Prison', 'Factions', 'Mini-games', 'RPG', 'Parkour', 'PvP'] },
      { name: 'playerCount', label: 'Max Players', type: 'number', required: true },
      { name: 'features', label: 'Server Features', type: 'textarea', required: true },
      { name: 'website', label: 'Website URL', type: 'text', required: false, placeholder: 'https://example.com' },
      { name: 'discord', label: 'Discord Invite', type: 'text', required: false, placeholder: 'https://discord.gg/...' },
    ]
  },
};

export const getCategoryById = (id: string): CategoryConfig | undefined => {
  return CATEGORIES[id];
};

export const getCategoryBySlug = (slug: string): CategoryConfig | undefined => {
  return Object.values(CATEGORIES).find(cat => cat.slug === slug);
};

export const getAllCategories = (): CategoryConfig[] => {
  return Object.values(CATEGORIES);
};
