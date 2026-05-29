/**
 * Optional name-pattern overrides per market GLB.
 * Add entries when auto-discovery mislabels parts; patterns match mesh node names (case-insensitive).
 */
export type MarketRigProfile = {
  id: string;
  urlPattern: RegExp;
  leftDoor?: RegExp[];
  rightDoor?: RegExp[];
  trunk?: RegExp[];
  headLight?: RegExp[];
  tailLight?: RegExp[];
  hazardLight?: RegExp[];
  sunroof?: RegExp[];
  wheel?: RegExp[];
};

/** Audi Q3–style Sketchfab SUV (`suv-mainstream.glb`). */
const suvQ3Profile: MarketRigProfile = {
  id: "suv-q3",
  urlPattern: /suv-mainstream/i,
  leftDoor: [
    /polySurface5638/i,
    /polySurface3173_Mesh_159_Door_Soft_Black_Plastic_Q3/i,
    /polySurface3103_Mesh_156_Door_Rubber/i,
    /polySurface3104_Mesh_157_Door_Black_Plastic_Noise/i,
  ],
  rightDoor: [
    /polySurface5634/i,
    /polySurface5632/i,
    /polySurface3102_Mesh_155_Door_Black_Plastic_Noise/i,
    /polySurface3173_Mesh_159_Door_Soft_Black_Plastic_Q4/i,
  ],
  trunk: [/Boot_ext2_Mesh_049_Carpaint/i, /Boot_ext17/i, /Boot_ext13_Mesh_045_Chrome/i, /Boot_ext5/i],
  headLight: [/^[^/]*HL\d/i, /Hl_Projection_lamp/i, /Hl_inner_glass/i, /Hl_Cover/i, /HL_Chrome/i],
  tailLight: [/Tail_upper_Red/i, /Tail_inner_Red/i, /Tail_inner_White/i, /Tail_Cover_White/i],
  hazardLight: [/Tail_upper_Red/i, /Tail_inner_Red/i, /Emiss/i],
  sunroof: [/Q3_Exteroir337_Mesh_179_Roof_glass/i],
  wheel: [/Q3_Tyre/i],
};

/**
 * Brabus G900: road wheels are baked into the body; only a rear spare is a separate rig.
 * Do not list `wheel` patterns here — global discovery excludes spare / tailgate mounts.
 */
const offroadBrabusProfile: MarketRigProfile = {
  id: "offroad-brabus",
  urlPattern: /offroad-mainstream/i,
  headLight: [/light1/i, /_light/i],
  tailLight: [/red_b/i, /tail/i],
  wheel: [],
};

export const MARKET_RIG_PROFILES: MarketRigProfile[] = [suvQ3Profile, offroadBrabusProfile];

export function resolveMarketRigProfile(modelUrl?: string): MarketRigProfile | null {
  if (!modelUrl) {
    return null;
  }
  return MARKET_RIG_PROFILES.find((profile) => profile.urlPattern.test(modelUrl)) ?? null;
}
