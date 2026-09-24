export function calculateMirrorAggregate(status:string,responses:(number|null)[][],dimensions:number,minParticipants=5):(number|null)[]|null {
  if(status!=="closed"||responses.length<minParticipants)return null;
  return Array.from({length:dimensions},(_,i)=>{
    const values=responses.map(r=>r[i]).filter((v):v is number=>typeof v==="number"&&Number.isFinite(v));
    return values.length>=minParticipants?Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10:null;
  });
}
export function comparePreferences(a:number[],b:number[]) {
  if(a.length!==b.length)throw new Error("Respostas incompletas.");
  return a.map((value,i)=>({index:i,match:value===b[i],first:value,second:b[i]}));
}

export function mirrorHighlights(self:number[],team:(number|null)[]){
  const comparable=team.flatMap((score,index)=>score===null||!Number.isFinite(self[index])?[]:[{index,difference:Math.round((self[index]-score)*10)/10,gap:Math.abs(self[index]-score)}]);
  if(!comparable.length)return {agreement:null,gap:null};
  const byAgreement=[...comparable].sort((a,b)=>a.gap-b.gap||a.index-b.index);
  const byGap=[...comparable].sort((a,b)=>b.gap-a.gap||a.index-b.index);
  return {agreement:byAgreement[0],gap:byGap[0].gap>=0.5?byGap[0]:null};
}
