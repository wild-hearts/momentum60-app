// The Wheel: eight areas scored one to ten, drawn as a wheel, and re-scored at day 30 and day 60
// so the wheels can be laid over each other. DRAFT AREAS for Naomi to review: adapted from Glow90's
// Glow Wheel, with "Skin and care" and "Style and being seen" replaced by Rest and Courage.
export const WHEEL=[
 {id:'thoughts',label:'Thoughts',prompt:'How you talk to yourself when nobody is listening.'},
 {id:'energy',label:'Energy',prompt:'What you have left by the end of an ordinary day.'},
 {id:'movement',label:'Movement',prompt:'How much your body actually moves, not how fit you are.'},
 {id:'food',label:'Food',prompt:'Whether eating feels like care or like management.'},
 {id:'rest',label:'Rest',prompt:'Whether you sleep, and stop, when you need to.'},
 {id:'courage',label:'Courage',prompt:'How often you do the scary thing before you feel ready.'},
 {id:'confidence',label:'Confidence',prompt:'How much room you take up in a room.'},
 {id:'connection',label:'Connection',prompt:'Who actually knows what is going on with you.'}
];
export const CHECKPOINTS=[{day:1,label:'Start'},{day:30,label:'Day 30'},{day:60,label:'Day 60'}];
export const wheelAverage=scores=>{const v=WHEEL.map(s=>scores?.[s.id]).filter(n=>typeof n==='number');return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length*10)/10:0};
