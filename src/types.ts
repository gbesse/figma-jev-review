// Purpose: Define the finite pack, selected-node, result, and Jev wire contracts shared by plugin and UI.
export type TextCandidate = { id: string; name: string; text: string };
export type Criterion = { id: string; label: string; type: 'noul'|'score'; instructions: string; criteria?: string[]; weakBelow: number; group?: string };
export type ReviewPack = { id: string; title: string; criteria: Criterion[] };
export type JevAnswer = { type:'noul';noul:number }|{type:'score';score:number;probabilities:Record<string,number>;legend:Record<string,string>;confidence:number}|{type:'choice';choice:string;probabilities:Record<string,number>;confidence:number};
export type JevResponse = { model:string;answers:Record<string,JevAnswer>;usage:{input_tokens:number;output_tokens:number} };
export type ReviewResult = { criterion:Criterion;value:number;answer:JevAnswer;citation?:TextCandidate };
