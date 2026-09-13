import data from "./questions.json";
export type Field={id:string;label:string;type:string;options?:string[];when?:{id:string;value:string}};
export type Answers=Record<string,string>;
export const sections=data as {id:string;title:string;fields:Field[]}[];
export function visible(field:Field,answers:Answers){return !field.when || answers[field.when.id]===field.when.value;}
export function cleanAnswers(answers:Answers){return Object.fromEntries(sections.flatMap(s=>s.fields).filter(f=>f.type!=="note"&&visible(f,answers)).map(f=>[f.id,answers[f.id]||""]));}