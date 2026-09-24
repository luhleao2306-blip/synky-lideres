export function calculateMirrorAggregate(status:string,responses:(number|null)[][],dimensions:number,minParticipants=5):(number|null)[]|null {
  if(status!=="closed"||responses.length<minParticipants)return null;
  return Array.from({length:dimensions},(_,i)=>{
    const values=responses.map(r=>r[i]).filter((v):v is number=>typeof v==="number"&&Number.isFinite(v));
    return values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10:null;
  });
}
export function comparePreferences(a:number[],b:number[]) {
  if(a.length!==b.length)throw new Error("Respostas incompletas.");
  return a.map((value,i)=>({index:i,match:value===b[i],first:value,second:b[i]}));
}
