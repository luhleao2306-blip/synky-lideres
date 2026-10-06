export type JourneyTheme = "confidence" | "boundaries" | "pressure" | "custom";
export type JourneyView = "overview" | "starting" | "diagnosis" | "plan" | "exercises" | "journal" | "review";
export type PanelView = JourneyView | "courses" | "classroom" | "activities" | "assessments" | "grades" | "library" | "experiences" | "mirror" | "decisions" | "communication" | "energy" | "career" | "thermometer" | "evolution" | "results" | "team" | "settings" | "platform";
export type Rating = 1 | 2 | 3 | 4 | 5;
export type Challenge = { theme: JourneyTheme; title: string; context: string; pattern: "recurring" | "episode" | "unsure"; impact: Rating | null; frequency: Rating | null; willingness: Rating | null };
export type Diagnostic = { id: string; at: string; theme: JourneyTheme; answers: number[]; confidence: Rating };
export type DiagnosticDraft = { open: boolean; answers: (number | null)[]; confidence: Rating | null };
export type PracticePlan = { id: string; cycle: number; status: "draft" | "active" | "paused" | "completed"; goal: string; context: string; steps: string[]; trigger: string; obstacles: string; support: string; days: number[]; reminderTime: string; reviewEvery: 7 | 14; createdAt: string; startedAt: string | null; completedAt: string | null };
export type JournalEntry = { id: string; planId: string; date: string; situation: string; action: string; result: string; learning: string; obstacle: string; confidenceBefore: Rating | null; confidenceAfter: Rating | null; createdAt: string; updatedAt: string };
export type ExerciseRecord = { id: string; planId: string; exerciseId: string; title: string; responses: string[]; choices?: number[]; createdAt: string };
export type ExerciseDraft = { exerciseId: string; responses: string[]; choices: number[]; stage: number } | null;
export type ProgressReview = { id: string; planId: string; date: string; changed: string; difficult: string; learned: string; evidence: string; decision: "continue" | "adjust" | "complete"; adjustment: string; confidence: Rating | null; createdAt: string };
export type JournalDraft = Omit<JournalEntry, "id" | "planId" | "createdAt" | "updatedAt"> & { editingId: string | null };
export type ReviewDraft = Omit<ProgressReview, "id" | "planId" | "createdAt">;
export type PersonalJourney = { id: string; createdAt: string; updatedAt: string; archivedAt: string | null; challenge: Challenge; diagnostics: Diagnostic[]; diagnosticDraft: DiagnosticDraft; plan: PracticePlan | null; planHistory: PracticePlan[]; entries: JournalEntry[]; exercises: ExerciseRecord[]; exerciseDraft: ExerciseDraft; journalDraft: JournalDraft | null; reviews: ProgressReview[]; reviewDraft: ReviewDraft | null };
export type JourneyWorkspaceData = { version: 1; selectedId: string | null; startingDraft: Challenge; journeys: PersonalJourney[]; updatedAt: string };
type DiagnosticQuestion = { text: string; behavior: string; helpful: boolean; practice: string };
type ThemeDefinition = { id: JourneyTheme; title: string; short: string; description: string; intention: string; accent: string; questions: DiagnosticQuestion[]; goal: string; steps: string[]; trigger: string; obstacle: string };
export const frequencyLabels = ["Quase nunca", "Às vezes", "Muitas vezes", "Quase sempre"];
export const themeDefinitions: ThemeDefinition[] = [
  { id: "confidence", title: "Autoconfiança para decidir", short: "Decidir com clareza", description: "Sustentar uma escolha mesmo quando a certeza completa não vem.", intention: "Uma escolha possível. Um próximo passo consciente.", accent: "leaf", goal: "Tomar uma decisão delimitada com critérios claros, sem esperar certeza completa.", steps: ["Anotar os fatos disponíveis e o critério mais importante.", "Escolher um próximo passo que eu possa observar e revisar.", "Revisitar o que aconteceu e ajustar com novas evidências."], trigger: "Quando eu perceber que estou adiando uma decisão por falta de certeza.", obstacle: "Buscar mais opiniões sem definir quando vou decidir.", questions: [
    { text: "Antes de decidir, explicito qual critério importa mais naquela situação.", behavior: "Definir critérios", helpful: true, practice: "Anote um critério antes de comparar os caminhos." },
    { text: "Adio uma escolha mesmo quando já tenho informação suficiente para um próximo passo.", behavior: "Adiar em busca de certeza", helpful: false, practice: "Defina um prazo e um passo reversível para testar sua escolha." },
    { text: "Ouço uma perspectiva diferente sem transferir a decisão para a outra pessoa.", behavior: "Consultar sem terceirizar", helpful: true, practice: "Peça uma perspectiva e diga qual decisão continua sendo sua." },
    { text: "Quando alguém discorda, abandono meu critério sem investigar o motivo.", behavior: "Reagir à discordância", helpful: false, practice: "Pergunte pelo motivo da discordância antes de mudar o caminho." },
    { text: "Distingo o que posso testar do que exige mais cuidado antes de agir.", behavior: "Dimensionar o risco", helpful: true, practice: "Escolha uma decisão pequena e reversível para começar." },
    { text: "Depois de escolher, revisito os efeitos para aprender, sem resumir tudo a acertar ou errar.", behavior: "Aprender com a escolha", helpful: true, practice: "Registre um efeito observado e uma mudança para a próxima tentativa." },
  ] },
  { id: "boundaries", title: "Limites e priorização", short: "Escolher o que cabe", description: "Fazer espaço para o importante e comunicar o que precisa ser renegociado.", intention: "Nem tudo ao mesmo tempo. O essencial com intenção.", accent: "sand", goal: "Explicitar uma prioridade e renegociar um pedido que ultrapassa minha capacidade.", steps: ["Listar os compromissos e escolher o que mais importa hoje.", "Dizer o que cabe, o que precisa mudar e propor uma alternativa.", "Observar o efeito do combinado e retomá-lo quando necessário."], trigger: "Quando surgir um novo pedido antes de eu terminar a prioridade combinada.", obstacle: "Aceitar o pedido por receio de decepcionar alguém.", questions: [
    { text: "Ao receber um novo pedido, verifico os compromissos que já assumi.", behavior: "Reconhecer a capacidade", helpful: true, practice: "Consulte seus compromissos antes de responder a um novo pedido." },
    { text: "Digo sim antes de entender o prazo e o impacto do pedido.", behavior: "Aceitar sem dimensionar", helpful: false, practice: "Pergunte pelo prazo e pelo impacto antes de assumir o pedido." },
    { text: "Comunico o que precisa sair ou mudar quando uma nova prioridade entra.", behavior: "Negociar escolhas", helpful: true, practice: "Explique qual compromisso precisa ser renegociado." },
    { text: "Trato qualquer urgência de outra pessoa como minha prioridade imediata.", behavior: "Absorver urgências", helpful: false, practice: "Compare a urgência com o impacto antes de reorganizar seu dia." },
    { text: "Consigo apresentar um limite concreto e uma alternativa viável.", behavior: "Comunicar limites", helpful: true, practice: "Ensaie uma frase que diga o limite e ofereça uma alternativa." },
    { text: "Retomo os combinados quando a carga ou as prioridades mudam.", behavior: "Revisar compromissos", helpful: true, practice: "Reserve um momento para renegociar o que deixou de caber." },
  ] },
  { id: "pressure", title: "Gestão emocional sob pressão", short: "Responder com presença", description: "Perceber a reação, criar uma pausa e escolher como responder no trabalho.", intention: "Entre o impulso e a resposta, uma pausa sua.", accent: "rose", goal: "Criar uma pausa breve antes de responder em uma situação de pressão.", steps: ["Perceber a situação e nomear o que está acontecendo, sem concluir pela outra pessoa.", "Fazer uma pausa e separar fatos de interpretações.", "Escolher uma resposta e depois registrar o efeito que observei."], trigger: "Quando eu notar pressa para responder ou tensão em uma conversa difícil.", obstacle: "Achar que pausar significa perder autoridade ou tempo.", questions: [
    { text: "Percebo sinais de tensão antes de responder em uma conversa difícil.", behavior: "Perceber a própria reação", helpful: true, practice: "Identifique um sinal de tensão que aparece antes da sua resposta." },
    { text: "Respondo no impulso e só depois percebo como falei.", behavior: "Responder no impulso", helpful: false, practice: "Use uma frase de pausa antes de dar uma resposta importante." },
    { text: "Separo o fato observado da interpretação que fiz sobre a intenção de alguém.", behavior: "Separar fato e interpretação", helpful: true, practice: "Anote o fato que você observou e a interpretação que pode estar fazendo." },
    { text: "Sob pressão, deixo de ouvir informações que contrariam minha primeira impressão.", behavior: "Estreitar a escuta", helpful: false, practice: "Faça uma pergunta antes de sustentar sua primeira impressão." },
    { text: "Consigo pedir um tempo curto para organizar uma resposta.", behavior: "Criar uma pausa", helpful: true, practice: "Combine uma frase simples para pedir um momento e retomar a conversa." },
    { text: "Depois de uma situação tensa, revisito o que ajudou e o que quero tentar diferente.", behavior: "Revisar a resposta", helpful: true, practice: "Registre o que sua resposta produziu e uma alternativa para a próxima vez." },
  ] },
];
export const themeFor = (id: JourneyTheme) => themeDefinitions.find(theme => theme.id === id) || themeDefinitions[0];
export const newId = () => crypto.randomUUID();
export const todayKey = (now = new Date()) => now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
export const readableDate = (date: string) => new Date(date.length === 10 ? date + "T12:00:00" : date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
export const emptyChallenge = (): Challenge => ({ theme: "confidence", title: "", context: "", pattern: "unsure", impact: null, frequency: null, willingness: null });
export const emptyWorkspace = (): JourneyWorkspaceData => ({ version: 1, selectedId: null, startingDraft: emptyChallenge(), journeys: [], updatedAt: new Date().toISOString() });
export const blankDiagnostic = (): DiagnosticDraft => ({ open: true, answers: Array(6).fill(null), confidence: null });
export const blankJournal = (): JournalDraft => ({ editingId: null, date: todayKey(), situation: "", action: "", result: "", learning: "", obstacle: "", confidenceBefore: null, confidenceAfter: null });
export const blankReview = (): ReviewDraft => ({ date: todayKey(), changed: "", difficult: "", learned: "", evidence: "", decision: "continue", adjustment: "", confidence: null });
export function validateChallenge(challenge: Challenge) {
  if (challenge.title.trim().length < 8) return "Descreva seu desafio em uma frase com pelo menos 8 caracteres.";
  if (challenge.context.trim().length < 10) return "Conte uma situação concreta em que esse desafio aparece.";
  if (!challenge.impact || !challenge.frequency || !challenge.willingness) return "Marque impacto, frequência e disposição para agir.";
  return null;
}
export function createJourney(challenge: Challenge, now = new Date().toISOString()): PersonalJourney {
  const error = validateChallenge(challenge); if (error) throw new Error(error);
  return { id: newId(), createdAt: now, updatedAt: now, archivedAt: null, challenge: { ...challenge }, diagnostics: [], diagnosticDraft: blankDiagnostic(), plan: null, planHistory: [], entries: [], exercises: [], exerciseDraft: null, journalDraft: null, reviews: [], reviewDraft: null };
}
export function diagnose(theme: JourneyTheme, answers: number[]) {
  const questions = themeFor(theme).questions;
  if (answers.length !== questions.length || answers.some(answer => !Number.isInteger(answer) || answer < 0 || answer > 3)) throw new Error("Responda às seis situações para construir a reflexão.");
  const observations = questions.map((question, index) => ({ ...question, frequency: answers[index], support: question.helpful ? answers[index] : 3 - answers[index] }));
  const strengths = observations.filter(item => item.support >= 2);
  const focus = [...observations].sort((a, b) => a.support - b.support)[0];
  return { strengths, focus, attention: observations.filter(item => item.support <= 1), explanation: "Cada resposta indica uma frequência percebida nas últimas duas semanas. Para sugerir uma prática, observamos o comportamento de apoio menos frequente ou a reação que mais se repete. Em caso de empate, seguimos a ordem das perguntas. Você pode escolher outro foco no plano." };
}
export function suggestedPlan(theme: JourneyTheme, cycle = 1, now = new Date().toISOString()): PracticePlan {
  const definition = themeFor(theme);
  return { id: newId(), cycle, status: "draft", goal: definition.goal, context: "Na próxima situação de trabalho relacionada ao meu desafio.", steps: [...definition.steps], trigger: definition.trigger, obstacles: definition.obstacle, support: "", days: [1, 3, 5], reminderTime: "", reviewEvery: 7, createdAt: now, startedAt: null, completedAt: null };
}
export function validatePlan(plan: PracticePlan) {
  if (plan.goal.trim().length < 10 || plan.context.trim().length < 8) return "Defina um objetivo observável e o contexto em que vai praticar.";
  if (plan.steps.length !== 3 || plan.steps.some(step => step.trim().length < 5)) return "Descreva os três passos curtos da prática.";
  if (!plan.days.length) return "Escolha pelo menos um dia para organizar a prática.";
  if (plan.trigger.trim().length < 5) return "Diga qual situação vai servir de gatilho para a prática.";
  return null;
}
export function validateJournal(entry: JournalDraft) {
  if ([entry.situation, entry.action, entry.result, entry.learning].some(value => value.trim().length < 5)) return "Preencha situação, ação, resultado e aprendizado com pelo menos 5 caracteres.";
  if (!validDateKey(entry.date) || entry.date > todayKey()) return "Escolha uma data válida, até hoje.";
  return null;
}
export function validateReview(review: ReviewDraft) {
  if ([review.changed, review.difficult, review.learned, review.evidence].some(value => value.trim().length < 5)) return "Responda às quatro perguntas da revisão com pelo menos 5 caracteres.";
  if (review.decision === "adjust" && review.adjustment.trim().length < 8) return "Descreva o ajuste que pretende fazer no plano.";
  if (!validDateKey(review.date) || review.date > todayKey()) return "Escolha uma data válida para a revisão, até hoje.";
  return null;
}
export function nextReviewDate(journey: PersonalJourney) {
  const plan = journey.plan;
  if (!plan?.startedAt || plan.status !== "active") return null;
  const reviews = journey.reviews.filter(review => review.planId === plan.id).sort((a, b) => b.date.localeCompare(a.date));
  const origin = new Date(reviews[0] ? reviews[0].date + "T12:00:00" : plan.startedAt);
  origin.setDate(origin.getDate() + plan.reviewEvery);
  return todayKey(origin);
}
export function nextJourneyView(journey: PersonalJourney, today = todayKey()): JourneyView {
  if (!journey.diagnostics.length || journey.diagnosticDraft.open) return "diagnosis";
  if (!journey.plan || journey.plan.status === "draft" || journey.plan.status === "paused") return "plan";
  const due = nextReviewDate(journey);
  if (journey.plan.status === "completed" || (due && due <= today)) return "review";
  return journey.entries.some(entry => entry.planId === journey.plan?.id) || journey.exercises.some(exercise => exercise.planId === journey.plan?.id) ? "journal" : "exercises";
}
export function journeyStages(journey: PersonalJourney) {
  const planId = journey.plan?.id;
  return [true, journey.diagnostics.length > 0 && !journey.diagnosticDraft.open, !!journey.plan && journey.plan.status !== "draft", journey.entries.some(entry => entry.planId === planId), journey.reviews.some(review => review.planId === planId)];
}
export function restartPlan(journey: PersonalJourney, now = new Date().toISOString()): PersonalJourney {
  if (!journey.plan) throw new Error("Crie um plano antes de iniciar outro ciclo.");
  const plan = { ...journey.plan, id: newId(), cycle: journey.plan.cycle + 1, status: "draft" as const, createdAt: now, startedAt: null, completedAt: null, steps: [...journey.plan.steps] };
  return { ...journey, updatedAt: now, plan, planHistory: [...journey.planHistory, { ...journey.plan }], diagnosticDraft: blankDiagnostic(), journalDraft: null, reviewDraft: null, exerciseDraft: null };
}
export function practiceSeries(entries: JournalEntry[], period: number, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - period + 1);
  const result: { label: string; range: string; count: number }[] = [];
  for (let offset = 0; offset < period; offset += 7) {
    const first = new Date(start); first.setDate(first.getDate() + offset);
    const last = new Date(start); last.setDate(last.getDate() + Math.min(period - 1, offset + 6));
    const from = todayKey(first), to = todayKey(last);
    result.push({ label: readableDate(from), range: readableDate(from) + " a " + readableDate(to), count: entries.filter(entry => entry.date >= from && entry.date <= to).length });
  }
  return result;
}
export function confidenceSeries(entries: JournalEntry[], period: number, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - period + 1);
  return entries.filter(entry => entry.date >= todayKey(start) && entry.date <= todayKey(now) && entry.confidenceBefore !== null && entry.confidenceAfter !== null).sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)).map((entry, index) => ({ label: readableDate(entry.date) + " · " + (index + 1), before: entry.confidenceBefore, after: entry.confidenceAfter, situation: entry.situation }));
}
export function reminderDue(plan: PracticePlan | null, now = new Date()) {
  return !!plan && plan.status === "active" && plan.days.includes(now.getDay()) && !!plan.reminderTime && plan.reminderTime <= String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
}
export const storageKey = (companyId: string, memberId: string) => "synky.personal-journeys.v1:" + encodeURIComponent(companyId) + ":" + encodeURIComponent(memberId);
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, max = 2000): value is string => typeof value === "string" && value.length <= max;
const rating = (value: unknown) => value === null || (Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5);
const iso = (value: unknown) => typeof value === "string" && Number.isFinite(Date.parse(value));
function validDateKey(value: unknown): value is string { if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const date = new Date(value + "T12:00:00"); return Number.isFinite(date.getTime()) && todayKey(date) === value; }
const strings = (value: unknown, count: number) => Array.isArray(value) && value.length <= count && value.every(item => text(item));
const datesAndId = (value: Record<string, unknown>) => text(value.id, 100) && iso(value.createdAt);
function validChallenge(value: unknown): value is Challenge { return isObject(value) && ["confidence", "boundaries", "pressure", "custom"].includes(String(value.theme)) && text(value.title, 180) && text(value.context) && ["recurring", "episode", "unsure"].includes(String(value.pattern)) && [value.impact, value.frequency, value.willingness].every(rating); }
function validPlan(value: unknown): value is PracticePlan { return isObject(value) && datesAndId(value) && Number.isInteger(value.cycle) && Number(value.cycle) > 0 && ["draft", "active", "paused", "completed"].includes(String(value.status)) && [value.goal, value.context, value.trigger, value.obstacles, value.support].every(item => text(item)) && strings(value.steps, 3) && (value.steps as unknown[]).length === 3 && Array.isArray(value.days) && value.days.length <= 7 && value.days.every(day => Number.isInteger(day) && day >= 0 && day <= 6) && (value.reminderTime === "" || (typeof value.reminderTime === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value.reminderTime))) && [7, 14].includes(Number(value.reviewEvery)) && (value.startedAt === null || iso(value.startedAt)) && (value.completedAt === null || iso(value.completedAt)); }
function validJournalDraft(value: unknown) { return isObject(value) && (value.editingId === null || text(value.editingId, 100)) && validDateKey(value.date) && [value.situation, value.action, value.result, value.learning, value.obstacle].every(item => text(item)) && rating(value.confidenceBefore) && rating(value.confidenceAfter); }
function validReviewDraft(value: unknown) { return isObject(value) && validDateKey(value.date) && [value.changed, value.difficult, value.learned, value.evidence, value.adjustment].every(item => text(item)) && ["continue", "adjust", "complete"].includes(String(value.decision)) && rating(value.confidence); }
export function parseWorkspace(raw: string): JourneyWorkspaceData {
  if (raw.length > 2_000_000) throw new Error("Este arquivo ultrapassa o limite de 2 MB para o armazenamento local.");
  let value: unknown; try { value = JSON.parse(raw); } catch { throw new Error("Não foi possível ler o arquivo. Escolha um backup JSON exportado pela Synky."); }
  if (isObject(value) && "workspace" in value) value = value.workspace;
  if (!isObject(value) || value.version !== 1 || !validChallenge(value.startingDraft) || !Array.isArray(value.journeys) || value.journeys.length > 40 || !iso(value.updatedAt) || (value.selectedId !== null && !text(value.selectedId, 100))) throw new Error("O backup não tem um formato de jornada compatível.");
  const ids = new Set<string>();
  for (const item of value.journeys) {
    if (!isObject(item) || !datesAndId(item) || !iso(item.updatedAt) || (item.archivedAt !== null && !iso(item.archivedAt)) || !validChallenge(item.challenge) || (item.plan !== null && !validPlan(item.plan)) || !Array.isArray(item.planHistory) || item.planHistory.length > 100 || !item.planHistory.every(validPlan)) throw new Error("Um dos planos do arquivo está incompleto ou inválido.");
    if (ids.has(String(item.id))) throw new Error("O arquivo contém jornadas com identificadores repetidos."); ids.add(String(item.id));
    const draft = item.diagnosticDraft;
    if (!isObject(draft) || typeof draft.open !== "boolean" || !Array.isArray(draft.answers) || draft.answers.length !== 6 || !draft.answers.every(answer => answer === null || (Number.isInteger(answer) && answer >= 0 && answer <= 3)) || !rating(draft.confidence)) throw new Error("Há uma reflexão incompleta ou inválida no arquivo.");
    if (!Array.isArray(item.diagnostics) || item.diagnostics.length > 100 || !item.diagnostics.every(entry => isObject(entry) && text(entry.id, 100) && iso(entry.at) && ["confidence", "boundaries", "pressure", "custom"].includes(String(entry.theme)) && Array.isArray(entry.answers) && entry.answers.length === 6 && entry.answers.every(answer => Number.isInteger(answer) && answer >= 0 && answer <= 3) && rating(entry.confidence) && entry.confidence !== null)) throw new Error("As autoavaliações do arquivo não são válidas.");
    if (!Array.isArray(item.entries) || item.entries.length > 500 || !item.entries.every(entry => isObject(entry) && datesAndId(entry) && iso(entry.updatedAt) && text(entry.planId, 100) && validJournalDraft({ ...entry, editingId: null }))) throw new Error("Os registros do diário não são válidos.");
    if (!Array.isArray(item.reviews) || item.reviews.length > 100 || !item.reviews.every(entry => isObject(entry) && datesAndId(entry) && text(entry.planId, 100) && validReviewDraft(entry))) throw new Error("As revisões do arquivo não são válidas.");
    if (!Array.isArray(item.exercises) || item.exercises.length > 200 || !item.exercises.every(entry => isObject(entry) && datesAndId(entry) && text(entry.planId, 100) && text(entry.exerciseId, 100) && text(entry.title, 200) && strings(entry.responses, 10) && (entry.choices === undefined || (Array.isArray(entry.choices) && entry.choices.length <= 3 && entry.choices.every(choice => Number.isInteger(choice) && choice >= 0 && choice <= 2))))) throw new Error("Os exercícios do arquivo não são válidos.");
    if (item.journalDraft !== null && !validJournalDraft(item.journalDraft)) throw new Error("O rascunho do diário não é válido.");
    if (item.reviewDraft !== null && !validReviewDraft(item.reviewDraft)) throw new Error("O rascunho da revisão não é válido.");
    if (item.exerciseDraft !== null && (!isObject(item.exerciseDraft) || !text(item.exerciseDraft.exerciseId, 100) || !strings(item.exerciseDraft.responses, 10) || !Number.isInteger(item.exerciseDraft.stage) || Number(item.exerciseDraft.stage) < 0 || Number(item.exerciseDraft.stage) > 3 || !Array.isArray(item.exerciseDraft.choices) || item.exerciseDraft.choices.length > 3 || !item.exerciseDraft.choices.every(choice => Number.isInteger(choice) && choice >= 0 && choice <= 2))) throw new Error("O rascunho de exercício não é válido.");
  }
  if (value.selectedId !== null && !ids.has(String(value.selectedId))) throw new Error("A jornada selecionada não está presente no arquivo.");
  // Rebuild the top level to discard unrelated metadata or imported account identifiers.
  return { version: 1, selectedId: value.selectedId as string | null, startingDraft: value.startingDraft, journeys: value.journeys as PersonalJourney[], updatedAt: value.updatedAt as string };
}
export function mergeWorkspaces(current: JourneyWorkspaceData, incoming: JourneyWorkspaceData) {
  const existing = new Set(current.journeys.map(journey => journey.id));
  const additions = incoming.journeys.filter(journey => !existing.has(journey.id));
  if (current.journeys.length + additions.length > 40) throw new Error("O espaço local comporta até 40 jornadas. Exporte seus registros antes de organizar o histórico.");
  return { workspace: { ...current, journeys: [...current.journeys, ...additions], selectedId: current.selectedId || additions[0]?.id || null, updatedAt: new Date().toISOString() } as JourneyWorkspaceData, added: additions.length };
}
export function saveWorkspace(storage: Pick<Storage, "setItem">, key: string, workspace: JourneyWorkspaceData) {
  const raw = JSON.stringify(workspace); parseWorkspace(raw); storage.setItem(key, raw);
}
export function personalSummary(journey: PersonalJourney) {
  const plans = [...journey.planHistory, ...(journey.plan ? [journey.plan] : [])];
  const cycle = (id: string) => plans.find(plan => plan.id === id)?.cycle || "anterior";
  const fullDate = (value: string) => new Date(value.length === 10 ? value + "T12:00:00" : value).toLocaleDateString("pt-BR");
  return ["SYNKY LÍDERES · RESUMO PESSOAL", "Gerado em " + fullDate(new Date().toISOString()), "", "MEU PONTO DE PARTIDA", journey.challenge.title, journey.challenge.context,
    "Impacto percebido: " + journey.challenge.impact + "/5 · frequência: " + journey.challenge.frequency + "/5 · disposição para agir: " + journey.challenge.willingness + "/5",
    "", "AUTOAVALIAÇÕES", ...journey.diagnostics.map(item => fullDate(item.at) + " · confiança percebida: " + item.confidence + "/5\nFoco sugerido: " + diagnose(item.theme, item.answers).focus.behavior + "\n"),
    "", "PLANOS DE PRÁTICA", ...(plans.length ? plans.map(plan => "Ciclo " + plan.cycle + " · " + ({ draft: "em construção", active: "em prática", paused: "em pausa", completed: "concluído" }[plan.status]) + "\nObjetivo: " + plan.goal + "\nContexto: " + plan.context + "\n" + plan.steps.map((step,i) => (i+1) + ". " + step).join("\n") + "\nGatilho: " + plan.trigger + "\nObstáculos: " + plan.obstacles + "\nApoio: " + plan.support + "\nRevisão a cada " + plan.reviewEvery + " dias.\n") : ["Plano ainda não definido."]),
    "", "EXERCÍCIOS E REFLEXÕES", ...journey.exercises.map(item => fullDate(item.createdAt) + " · ciclo " + cycle(item.planId) + " · " + item.title + "\n" + item.responses.join("\n") + "\n"),
    "", "DIÁRIO DE PRÁTICA", ...journey.entries.map(entry => fullDate(entry.date) + " · ciclo " + cycle(entry.planId) + "\nSituação: " + entry.situation + "\nAção: " + entry.action + "\nResultado: " + entry.result + "\nAprendizado: " + entry.learning + "\nObstáculo: " + (entry.obstacle || "não informado") + "\nConfiança antes/depois: " + (entry.confidenceBefore ?? "não informada") + " / " + (entry.confidenceAfter ?? "não informada") + "\n"),
    "", "REVISÕES", ...journey.reviews.map(review => fullDate(review.date) + " · ciclo " + cycle(review.planId) + "\nO que mudou: " + review.changed + "\nO que segue difícil: " + review.difficult + "\nO que aprendi: " + review.learned + "\nEvidências: " + review.evidence + "\nDecisão: " + ({ continue: "continuar", adjust: "ajustar", complete: "encerrar" }[review.decision]) + (review.adjustment ? "\nAjuste: " + review.adjustment : "") + "\n")].join("\n");
}
