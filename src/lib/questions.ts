import data from "./questions.json";
export type Field={id:string;label:string;type:string;options?:string[];when?:{id:string;value:string}};
export type Answers=Record<string,string>;
export const sections=data as {id:string;title:string;fields:Field[]}[];
export function visible(field:Field,answers:Answers){return !field.when || answers[field.when.id]===field.when.value;}
export function cleanAnswers(answers:Answers){return Object.fromEntries(sections.flatMap(s=>s.fields).filter(f=>f.type!=="note"&&visible(f,answers)).map(f=>[f.id,answers[f.id]||""]));}

export const yesNoOnly=new Set([
 "q4006","q4458","q4500","q6495","q10352","q10592",
 "q11148","q11224","q11274","q11320","q11366","q12897"
]);

export const yesNoDetails:Record<string,{prompt:string;detailsWhen?:"Yes"|"No"}>={
 q1135:{prompt:"Tell us which obligations could affect your training or nutrition."},
 q1265:{prompt:"Describe the upcoming travel, events, or schedule changes."},
 q1664:{prompt:"Which areas would you especially like to improve?"},
 q2346:{prompt:"Explain where, how severe it is, and which movements or activities aggravate it."},
 q2499:{prompt:"Describe the previous injury and how it could affect training."},
 q2573:{prompt:"List the surgeries and approximate dates."},
 q2650:{prompt:"Describe the exercises or movements you were advised to avoid or modify."},
 q2750:{prompt:"List the diagnosed conditions and anything your coach should know."},
 q2884:{prompt:"List the medications and, if you are comfortable, why you take them."},
 q3019:{prompt:"List the supplements you currently take."},
 q3133:{prompt:"List the food allergies or intolerances."},
 q3188:{prompt:"Describe the digestive issues you experience."},
 q3451:{prompt:"Share the additional health information that may be relevant."},
 q4128:{prompt:"Describe your experience and whether tracking was easy or difficult to maintain."},
 q4815:{prompt:"List the foods you dislike or do not want included."},
 q4884:{prompt:"List the foods you tend to overeat or find difficult to control."},
 q5169:{prompt:"What do you typically drink, how much, and how often?"},
 q5254:{prompt:"List the drinks and how often you have them."},
 q5334:{prompt:"Describe when and how often you eat late at night."},
 q5369:{prompt:"When do the cravings happen, and what foods do you crave?"},
 q5488:{prompt:"Describe what changes and which situations tend to trigger it."},
 q5581:{prompt:"Share any context you are comfortable providing."},
 q5675:{prompt:"Which diets did you follow, and what worked or did not work?"},
 q5911:{prompt:"Walk us through your current week of exercise."},
 q6323:{prompt:"What structured strength program did you follow?"},
 q6848:{prompt:"Which fitness tracker do you use?"},
 q7580:{prompt:"Which days are unavailable, and why?"},
 q7955:{prompt:"Which exercises are uncomfortable or unavailable to you?"},
 q8008:{prompt:"Describe where you feel discomfort and which exercises cause it."},
 q8170:{prompt:"Describe your current stretching or mobility routine."},
 q8222:{prompt:"Which areas feel stiff or restricted?"},
 q8286:{prompt:"Which movements are uncomfortable or difficult?"},
 q9865:{prompt:"Describe how you normally feel when you wake up."},
 q9906:{prompt:"Describe whether falling asleep, staying asleep, or both are difficult."},
 q9964:{prompt:"Share whether this is diagnosed or suspected and any relevant details."},
 q10482:{prompt:"Describe how you approached gaining muscle and the result."},
 q12615:{prompt:"What are you worried about?"},
 q12679:{prompt:"Share anything else you think your coach should know."}
};
