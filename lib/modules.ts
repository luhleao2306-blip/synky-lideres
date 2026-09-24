export const moduleKeys=["mirror","decisions","communication","energy","career","thermometer"] as const;
export type ModuleKey=typeof moduleKeys[number];
export const moduleNames:Record<ModuleKey,string>={mirror:"Espelho do Líder",decisions:"Decisões Sob Pressão",communication:"Raio X da Comunicação",energy:"Mapa de Energia",career:"Bússola de Carreira",thermometer:"Termômetro de Liderança"};
export type ModuleSettings=Record<ModuleKey,boolean>;
export const defaultModules=():ModuleSettings=>Object.fromEntries(moduleKeys.map(key=>[key,true])) as ModuleSettings;
export function resolveModules(raw:unknown):ModuleSettings{
  let parsed:Record<string,unknown>={};
  try{const value=typeof raw==="string"?JSON.parse(raw):raw;if(value&&typeof value==="object"&&!Array.isArray(value))parsed=value as Record<string,unknown>}catch{}
  return Object.fromEntries(moduleKeys.map(key=>[key,parsed[key]!==false])) as ModuleSettings;
}
