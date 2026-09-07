import {clone,ordered} from './backup.mjs';

export const normalize = text => String(text||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
export const EQUIPMENT = {machine:'Gép',cable:'Csiga / kábel',dumbbell:'Kézisúlyzó',barbell:'Rúd',bodyweight:'Saját testsúly',kettlebell:'Kettlebell',unknown:'Nem ismert eszköz'};
const MOVEMENTS = {
  chestPress:'Mellnyomás',chestFly:'Tárogatás',dip:'Tolódzkodás',row:'Vízszintes húzás / evezés',pulldown:'Függőleges húzás',straightPull:'Nyújtott karú lehúzás',
  romanian:'Csípőhajlítás nyújtottabb térddel',deadlift:'Felhúzás',backExtension:'Törzsfeszítés',shrug:'Vállöv emelése',shoulderPress:'Vállból nyomás',lateralRaise:'Oldalemelés',frontRaise:'Előreemelés',rearFly:'Hátsódelta-emelés',facePull:'Archoz húzás',uprightRow:'Állig húzás',
  curl:'Könyökhajlítás',wristCurl:'Csuklóhajlítás',tricepsPress:'Tricepszdomináns nyomás',tricepsExtension:'Könyöknyújtás',squat:'Térddomináns, összetett lábgyakorlat',legExtension:'Izolált térdnyújtás',legCurl:'Izolált térdhajlítás',hipThrust:'Csípőemelés',calfRaise:'Boka nyújtása / vádli',adduction:'Csípőközelítés',abduction:'Csípőtávolítás',
  crunch:'Hasprés',situp:'Felülés',legRaise:'Lábemelés',plank:'Statikus törzstartás',sidePlank:'Oldalsó törzstartás',rotation:'Törzsfordítás',bicycle:'Váltott hasprés',rollout:'Gördülés / törzsstabilizálás',carry:'Súlycipelés',swing:'Lendítés',cleanPress:'Felvétel és nyomás',burpee:'Burpee'
};

// Conservative name rules identify movement families, not clinical equivalence.
// Unknown/custom names remain available for manual selection only.
export function exerciseProfile(exercise){
  const name=normalize(exercise.name), muscle=normalize(exercise.muscle);
  let movement='',variant='',equipment='unknown';
  if(/kabel|csiga|crossover/.test(name))equipment='cable';
  else if(/smith|gep|peck.deck|pillango|labpres/.test(name))equipment='machine';
  else if(/kettlebell/.test(name))equipment='kettlebell';
  else if(/sulyzo|egykezes|goblet|koncentralt|kalapacs|kickback|arnold/.test(name))equipment='dumbbell';
  else if(/rud|barbell|back squat|front squat/.test(name))equipment='barbell';
  else if(/fekvotamasz|huzodzkodas|dips|plank|burpee|sit.up|lying leg raise|bicycle|orosz csavar/.test(name))equipment='bodyweight';
  // Descriptive tags are only used to rank within a recognized movement family.
  if(muscle==='mell'){
    if(/tarogatas|peck.deck|pillango/.test(name))movement='chestFly';
    else if(/dips/.test(name))movement='dip';
    else if(/fekvenyomas|mellnyom|fekvotamasz|padu nyomas/.test(name))movement='chestPress';
    if(movement==='chestPress'||movement==='chestFly')variant=/dontott|30 fok|ferde/.test(name)?'incline':/lejtos/.test(name)?'decline':'flat';
  }else if(muscle==='hat'){
    if(/evezes/.test(name))movement='row';
    else if(/nyujtott karu/.test(name))movement='straightPull';
    else if(/huzodzkodas|pulldown/.test(name))movement='pulldown';
    else if(/roman|jo reggelt/.test(name))movement='romanian';
    else if(/felhuzas/.test(name))movement='deadlift';
    else if(/hyperextension|hatrahajlitas/.test(name))movement='backExtension';
    else if(/vallranditas|shrug/.test(name))movement='shrug';
    if(/pulldown/.test(name))equipment='cable';
  }else if(muscle==='vall'){
    if(/oldalemeles/.test(name))movement='lateralRaise';
    else if(/eloreemeles/.test(name))movement='frontRaise';
    else if(/hatsodelta/.test(name))movement='rearFly';
    else if(/face pull/.test(name))movement='facePull';
    else if(/upright row/.test(name))movement='uprightRow';
    else if(/nyomas|vallnyomas|arnold press/.test(name))movement='shoulderPress';
  }else if(muscle==='bicepsz'){
    if(/csuklo/.test(name))movement='wristCurl';
    else if(/curl/.test(name)){movement='curl';variant=/hammer|kalapacs/.test(name)?'neutral':/incline|dontott/.test(name)?'incline':/preacher/.test(name)?'supported':'standard';}
  }else if(muscle==='tricepsz'){
    if(/fekvenyomas|dips/.test(name))movement='tricepsPress';
    else if(/tricepsz|francia nyomas/.test(name)){movement='tricepsExtension';variant=/overhead/.test(name)?'overhead':/francia/.test(name)?'french':/kickback/.test(name)?'kickback':/nyomas kabelen/.test(name)?'pushdown':'unknown';}
  }else if(muscle==='lab'){
    if(/labnyujtas/.test(name))movement='legExtension';
    else if(/labhajlitas/.test(name)){movement='legCurl';variant=/ulo/.test(name)?'seated':'lying';}
    else if(/borjuemeles|calf raise/.test(name)){movement='calfRaise';variant=/ulve/.test(name)?'seated':'standing';}
    else if(/adduktor/.test(name))movement='adduction';
    else if(/abduktor/.test(name))movement='abduction';
    else if(/hip thrust|csipoemeles/.test(name))movement='hipThrust';
    else if(/sumo felhuzas/.test(name))movement='deadlift';
    else if(/guggolas|kitores|labpres/.test(name))movement='squat';
  }else if(muscle==='has'){
    if(/oldalso plank/.test(name))movement='sidePlank';
    else if(/plank/.test(name))movement='plank';
    else if(/rollout/.test(name))movement='rollout';
    else if(/bicycle/.test(name))movement='bicycle';
    else if(/orosz csavar/.test(name))movement='rotation';
    else if(/labemeles/.test(name))movement='legRaise';
    else if(/felules|sit.up/.test(name))movement='situp';
    else if(/haspres|crunch/.test(name))movement='crunch';
  }else if(muscle==='egyeb'){
    if(/farmer/.test(name))movement='carry';
    else if(/kettlebell swing/.test(name))movement='swing';
    else if(/clean and press/.test(name))movement='cleanPress';
    else if(/burpee/.test(name))movement='burpee';
  }
  return {movement,label:MOVEMENTS[movement]||'Nem azonosított mozgás',variant,equipment,muscle,unilateral:/egykezes|egylabas|bolgar|kitores/.test(name),tags:exercise.muscles||[]};
}

export function previousExercise(data,exerciseId,excludeWorkoutId){
  for(const workout of ordered(data.workouts)){
    if(workout.id===excludeWorkoutId)continue;
    const exercise=workout.exercises.find(e=>e.exerciseId===exerciseId&&e.sets?.length);
    if(exercise)return {exercise,date:workout.date};
  }
  return null;
}

/** @param {any} data @param {any} current @param {any} draft @param {any} options */
export function recommendAlternatives(data,current,draft,options={}){
  const original=data.exercises.find(e=>e.id===current.exerciseId)||current;
  const profile=exerciseProfile(original);
  if(!profile.movement)return [];
  const used=new Set(draft.exercises.map(e=>e.exerciseId));
  return data.exercises.filter(e=>!used.has(e.id)).map(exercise=>{
    const p=exerciseProfile(exercise);
    if(p.muscle!==profile.muscle||p.movement!==profile.movement)return null;
    if(options.equipment&&p.equipment!==options.equipment)return null;
    const history=previousExercise(data,exercise.id,draft.id);
    const overlap=p.tags.filter(tag=>profile.tags.includes(tag)).length;
    const sameVariant=p.variant===profile.variant;
    const similarArmPosition=profile.movement==='tricepsExtension'&&['overhead','french'].includes(profile.variant)&&['overhead','french'].includes(p.variant);
    const notes=[];
    if(!sameVariant)notes.push('Eltérő testhelyzet vagy fogás; az izomterhelés hangsúlya változhat.');
    if(profile.equipment==='machine'&&['barbell','dumbbell','bodyweight'].includes(p.equipment))notes.push('A vezetett pálya helyett több stabilizálást igényelhet.');
    if(p.unilateral!==profile.unilateral)notes.push('Az egy- és kétoldalas végrehajtás eltér; a sorozatokat ehhez igazítsd.');
    if(p.equipment==='unknown')notes.push('Az eszköz a névből nem állapítható meg biztosan.');
    return {exercise,profile:p,history,reason:`${exercise.muscle} · ${p.label}`,notes,score:100+(sameVariant?20:similarArmPosition?15:0)+(p.unilateral===profile.unilateral?10:0)+Math.min(overlap,4)*2+(history?5:0)};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||a.exercise.name.localeCompare(b.exercise.name,'hu'));
}

export function replaceExercise(data,draft,index,replacementId){
  if(!draft||!Number.isInteger(index)||index<0||index>=draft.exercises.length)throw new Error('A cserélendő gyakorlat már nem található.');
  const replacement=data.exercises.find(e=>e.id===replacementId);
  if(!replacement)throw new Error('A kiválasztott gyakorlat nincs a gyakorlattárban.');
  if(draft.exercises.some(e=>e.exerciseId===replacementId))throw new Error('Ez a gyakorlat már szerepel az edzésben.');
  const history=previousExercise(data,replacementId,draft.id);
  const next=clone(draft),before=clone(next.exercises[index]);
  // New exercise identity and its own history only. Never transfer old weights
  // or unknown exercise-specific metadata onto a different movement.
  const after={exerciseId:replacement.id,name:replacement.name,muscle:replacement.muscle,sets:history?history.exercise.sets.map(s=>({weight:s.weight,reps:s.reps})):[{weight:'',reps:''}]};
  next.exercises[index]=after;
  return {draft:next,undo:{workoutId:draft.id,index,before,after:clone(after)}};
}

export function undoReplacement(draft,undo){
  if(!draft||draft.id!==undo.workoutId||JSON.stringify(draft.exercises[undo.index])!==JSON.stringify(undo.after))throw new Error('A gyakorlat azóta módosult, ezért a csere nem vonható vissza adatvesztés nélkül.');
  const next=clone(draft);next.exercises[undo.index]=clone(undo.before);return next;
}
