/**
 * Mock data for development and testing
 * Uses proper UUIDs to match database schema
 */

// Generate consistent UUIDs for mock data
export const MOCK_IDS = {
  resources: {
    castle: '550e8400-e29b-41d4-a716-446655440001',
    cyberpunk: '550e8400-e29b-41d4-a716-446655440002',
    shaders: '550e8400-e29b-41d4-a716-446655440003',
    plugin: '550e8400-e29b-41d4-a716-446655440004',
    skyislands: '550e8400-e29b-41d4-a716-446655440005',
    skins: '550e8400-e29b-41d4-a716-446655440006',
    caves: '550e8400-e29b-41d4-a716-446655440007',
  },
  users: {
    buildmaster: '550e8400-e29b-41d4-a716-446655440100',
    pixelcraft: '550e8400-e29b-41d4-a716-446655440101',
    shaderwizard: '550e8400-e29b-41d4-a716-446655440102',
    plugindev: '550e8400-e29b-41d4-a716-446655440103',
  }
};

export interface MockResource {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  downloads: number;
  rating: number;
  views: number;
  author: string;
  version: string;
  featured?: boolean;
}

export const mockResources: MockResource[] = [
  {
    id: MOCK_IDS.resources.castle,
    title: "Medieval Castle Adventure",
    description: "Explore a massive medieval castle with dungeons, towers, and hidden secrets",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=450&fit=crop",
    category: "Maps",
    downloads: 125000,
    rating: 4.8,
    views: 450000,
    author: "BuildMaster",
    version: "1.20.4",
    featured: true,
  },
  {
    id: MOCK_IDS.resources.cyberpunk,
    title: "Cyberpunk City Pack",
    description: "Transform your world into a futuristic cyberpunk metropolis",
    image: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&h=450&fit=crop",
    category: "Resource Pack",
    downloads: 89000,
    rating: 4.9,
    views: 320000,
    author: "PixelCraft",
    version: "1.20.2",
    featured: true,
  },
  {
    id: MOCK_IDS.resources.shaders,
    title: "Realistic Shaders Ultra",
    description: "Breathtaking realistic graphics with ray tracing and advanced lighting",
    image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=450&fit=crop",
    category: "Shaders",
    downloads: 234000,
    rating: 4.7,
    views: 780000,
    author: "ShaderWizard",
    version: "1.20.4",
    featured: true,
  },
  {
    id: MOCK_IDS.resources.plugin,
    title: "RPG Skills Plugin",
    description: "Add MMO-style skills and progression to your server",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=450&fit=crop",
    category: "Plugin",
    downloads: 45000,
    rating: 4.6,
    views: 150000,
    author: "PluginDev",
    version: "1.20.x",
  },
  {
    id: MOCK_IDS.resources.skyislands,
    title: "Sky Islands Survival",
    description: "Survive on floating islands in the sky with unique challenges",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=450&fit=crop",
    category: "Map",
    downloads: 67000,
    rating: 4.8,
    views: 210000,
    author: "SkyBuilder",
    version: "1.20.4",
  },
  {
    id: MOCK_IDS.resources.skins,
    title: "Anime Character Skins",
    description: "Collection of 100+ high-quality anime character skins",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=450&fit=crop",
    category: "Skins",
    downloads: 156000,
    rating: 4.5,
    views: 520000,
    author: "ArtistPro",
    version: "All Versions",
  },
  {
    id: MOCK_IDS.resources.caves,
    title: "Enhanced Caves Mod",
    description: "Discover new cave biomes, ores, and underground structures",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
    category: "Mod",
    downloads: 89000,
    rating: 4.7,
    views: 340000,
    author: "ModMaker",
    version: "1.20.4",
  },
];

export const mockResourceDetail = {
  id: MOCK_IDS.resources.castle,
  title: "Medieval Castle Adventure",
  description: `Embark on an epic journey through this massive medieval castle map! 
  
This detailed build features:
- 10+ unique towers and keeps
- Underground dungeons with hidden treasures
- Royal throne room and great hall
- Fully furnished living quarters
- Secret passages and hidden rooms
- Compatible with multiplayer servers
- Optimized for smooth performance

Perfect for adventure maps, roleplay servers, or just exploring with friends!`,
  longDescription: `# Welcome to Medieval Castle Adventure

## Overview
This is one of the most detailed castle builds you'll ever experience in Minecraft. Spanning over 500x500 blocks, every corner has been carefully crafted to create an immersive medieval experience.

## Features
### Architecture
- **10 Unique Towers**: Each tower has its own design and purpose
- **Great Hall**: Host banquets and royal gatherings
- **Throne Room**: Rule your kingdom from the golden throne
- **Chapel**: A beautiful place of worship with stained glass

### Exploration
- **Secret Passages**: Discover hidden routes throughout the castle
- **Underground Dungeons**: Face challenges in the depths below
- **Treasure Rooms**: Find hidden loot in secret chambers

## Installation
1. Download the map file
2. Extract to your saves folder
3. Launch Minecraft and select the world
4. Enjoy your adventure!

## Credits
Built by BuildMaster over 6 months with love and dedication.`,
  images: [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=675&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=675&fit=crop",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=675&fit=crop",
  ],
  category: "Maps",
  downloads: 125000,
  rating: 4.8,
  views: 450000,
  author: {
    id: MOCK_IDS.users.buildmaster,
    name: "BuildMaster",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BuildMaster",
    uploads: 23,
    followers: 15400,
  },
  version: "1.20.4",
  gameVersions: ["1.20.x", "1.19.x"],
  fileSize: "45.2 MB",
  uploadDate: "2024-03-15",
  lastUpdate: "2024-03-20",
  license: "Creative Commons BY-NC-SA",
  tags: ["Adventure", "Medieval", "Castle", "Exploration", "Multiplayer"],
};
