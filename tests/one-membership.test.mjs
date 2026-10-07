import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

const compiled = ts.transpileModule(readFileSync(new URL('../lib/one-membership.ts',import.meta.url),'utf8'), {compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const { oneMemberIdentity } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
function database() {
  const sql = new DatabaseSync(':memory:');
  sql.exec('CREATE TABLE synky_one_identities(one_user_id TEXT PRIMARY KEY,user_id TEXT NOT NULL)');
  sql.exec(`CREATE TABLE companies(id TEXT PRIMARY KEY,name TEXT,kind TEXT,created_at TEXT); CREATE TABLE members(id TEXT PRIMARY KEY,company_id TEXT,user_id TEXT,email TEXT,name TEXT,role TEXT,UNIQUE(company_id,user_id));`);
  const db={prepare(query){let values=[];return {bind(...v){values=v;return this;},async first(){return sql.prepare(query).get(...values)||null;},async all(){return {results:sql.prepare(query).all(...values)};},async run(){return sql.prepare(query).run(...values);}};},async batch(items){sql.exec('BEGIN');try{const out=[];for(const item of items)out.push(await item.run());sql.exec('COMMIT');return out;}catch(e){sql.exec('ROLLBACK');throw e;}}};
  return {sql,db};
}
const client = {id:'test-client',email:'client@example.test',name:'Cliente isolado'};
test('novo cliente autorizado ganha somente um espaço pessoal e perfil participante',async()=>{
  const {sql,db}=database();const user=await oneMemberIdentity(db,client);
  assert.equal(user.userId,'one:test-client');assert.equal(user.platformAdmin,false);
  assert.equal(sql.prepare('SELECT kind FROM companies').get().kind,'personal');
  assert.equal(sql.prepare('SELECT role FROM members').get().role,'participant');
  await Promise.all([oneMemberIdentity(db,client),oneMemberIdentity(db,client)]);
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM members').get().n,1);
});
test('dois clientes nunca compartilham um espaço',async()=>{
  const {sql,db}=database();await oneMemberIdentity(db,client);await oneMemberIdentity(db,{...client,id:'other',email:'other@example.test'});
  assert.equal(sql.prepare('SELECT COUNT(DISTINCT company_id) n FROM members').get().n,2);
});
test('vínculo existente preserva ID, empresa, papel e progresso referenciado',async()=>{
  const {sql,db}=database();sql.exec("INSERT INTO companies VALUES('original','Empresa','organization','2026-01-01');INSERT INTO members VALUES('member','original','local-user','CLIENT@example.test','Nome','leader')");
  const user=await oneMemberIdentity(db,client);assert.equal(user.userId,'local-user');
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM companies').get().n,1);
  assert.equal(sql.prepare('SELECT role FROM members').get().role,'leader');
  const changed=await oneMemberIdentity(db,{...client,email:'updated@example.test'});assert.equal(changed.userId,'local-user');
});
test('e-mail legado ambíguo não mistura dados',async()=>{
  const {sql,db}=database();sql.exec("INSERT INTO members VALUES('a','a','u1','client@example.test','A','participant');INSERT INTO members VALUES('b','b','u2','client@example.test','B','participant')");
  await assert.rejects(oneMemberIdentity(db,client),/Ambiguous/);
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM synky_one_identities').get().n,0);
});
test('admin central explícito é reconhecido; texto true não eleva cliente',async()=>{
  const {db}=database();assert.equal((await oneMemberIdentity(db,{...client,is_admin:true})).platformAdmin,true);
  assert.equal((await oneMemberIdentity(db,{...client,is_admin:'true'})).platformAdmin,false);
});
function authHarness({status=200,throwFetch=false}={}) {
  let calls=0,localCalls=0;
  const source=readFileSync(new URL('../app/guest-auth.ts',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const context={exports:{},env:{DB:{}},crypto,AbortSignal,fetch:async()=>{if(throwFetch)throw Error('offline');return {ok:status===200,json:async()=>client};},oneMemberIdentity:async()=>{calls++;return {userId:'one:test-client',isGuest:false};},identityFromCookie:async()=>{localCalls++;return {userId:'different-local-user'};},getChatGPTUser:async()=>null,isPlatformAdmin:()=>false,TextEncoder};
  vm.runInNewContext(code,context);return {get:context.exports.getAppUser,counts:()=>({calls,localCalls})};
}
test('cookie Synky One tem prioridade sobre sessão local de outra pessoa',async()=>{
  const h=authHarness();const result=await h.get(new Request('https://leaders.synky.com.br/app',{headers:{cookie:`synky_session=other; __Host-synky_one_access=${'a'.repeat(100)}`}}));
  assert.equal(result.user.userId,'one:test-client');assert.deepEqual(h.counts(),{calls:1,localCalls:0});
});
test('permissão revogada, token inválido e falha de rede não criam vínculo nem usam sessão alternativa',async()=>{
  for(const options of [{status:403},{throwFetch:true}]){const h=authHarness(options);const result=await h.get(new Request('https://leaders.synky.com.br/app',{headers:{cookie:`__Host-synky_one_access=${'a'.repeat(100)}`}}));assert.equal(result.user,null);assert.deepEqual(h.counts(),{calls:0,localCalls:0});}
  const h=authHarness();assert.equal((await h.get(new Request('https://leaders.synky.com.br/app',{headers:{cookie:'__Host-synky_one_access=invalid'}}))).user,null);assert.equal(h.counts().calls,0);
});
test('uma inicialização cancelada não bloqueia a próxima requisição D1', {timeout:1000}, async()=>{
  const source=readFileSync(new URL('../lib/cloudflare-auth.ts',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const context={exports:{},TextEncoder,env:{},console};vm.runInNewContext(code,context);
  const stalled={prepare(){return {run:()=>new Promise(()=>{})};}};
  let statements=0;const next={prepare(){return {run:async()=>{statements++;}};}};
  void context.exports.ensureAuthSchema(stalled);
  await context.exports.ensureAuthSchema(next);
  assert.ok(statements>1);
});
