/**
 * Minecraft Gallery Configuration
 * Centralized configuration for the application
 */

export const config = {
  app: {
    name: 'Minecraft Gallery',
    description: 'A premium platform for hosting and discovering Minecraft resources',
    url: process.env.NODE_ENV === 'production' 
      ? 'https://minecraft-gallery.lovable.app' 
      : 'http://localhost:5173'
  },

  auth: {
    providers: ['email'], // Future: 'google', 'discord', 'microsoft'
    requireEmailVerification: false, // Set to true in production
    sessionPersistence: true
  },

  resources: {
    categories: [
      'Maps',
      'Plugins', 
      'Mods',
      'Modpacks',
      'Resource Packs',
      'Texture Packs',
      'Shaders',
      'Skins',
      'Schematics',
      'Datapacks',
      'Worlds',
      'Seeds',
      'Builds'
    ],
    maxUploadSize: 100 * 1024 * 1024, // 100MB
    allowedFileTypes: ['.zip', '.jar', '.mcworld', '.schematic', '.png', '.json']
  },

  profile: {
    maxBioLength: 500,
    maxUsernameLength: 30,
    minUsernameLength: 3
  },

  roles: {
    user: 'user',
    creator: 'creator',
    moderator: 'moderator',
    admin: 'admin'
  } as const
};

export type AppRole = keyof typeof config.roles;
