export function brazilDay(value:Date=new Date()) {
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(value);
  const find=(type:string)=>parts.find(part=>part.type===type)?.value||"";
  return `${find("year")}-${find("month")}-${find("day")}`;
}
