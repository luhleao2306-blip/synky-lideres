import assert from "node:assert/strict";
import { test } from "node:test";

const base = "http://localhost:5173";

class Visitor {
  cookie = "";
  async call(path = "/api/app", body) {
    const response = await fetch(base + path, {
      method: body ? "POST" : "GET",
      headers: { ...(this.cookie ? { cookie: this.cookie } : {}), ...(body ? { "content-type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const cookie = response.headers.get("set-cookie");
    if (cookie) this.cookie = cookie.split(";")[0];
    const data = await response.json();
    return { status: response.status, data };
  }
  async get(path = "/api/app") {
    const { status, data } = await this.call(path);
    assert.equal(status, 200, JSON.stringify(data));
    return data;
  }
  async post(action, payload = {}) {
    const { status, data } = await this.call("/api/app", { action, ...payload });
    assert.equal(status, 200, `${action}: ${JSON.stringify(data)}`);
    return data;
  }
}

test("fluxos públicos completos e isolamento entre visitantes", async () => {
  const suffix = crypto.randomUUID().slice(0, 8);
  const leader = new Visitor();
  const outsider = new Visitor();
  const first = await leader.get();
  const other = await outsider.get();
  assert.equal(first.isGuest, true);
  assert.equal(first.membership.kind, "personal");
  assert.notEqual(first.membership.companyId, other.membership.companyId);
  assert.equal(first.platformCompanies.length, 0);
  assert.equal((await outsider.call(`/api/app?company=${first.membership.companyId}`)).status, 403);

  await leader.post("rename_profile", { name: "Líder Teste" });
  await leader.post("set_contact_email", { email: `leader-${suffix}@example.com` });
  const leaderData = await leader.get();
  assert.equal(leaderData.user.name, "Líder Teste");
  assert.equal(leaderData.user.email, `leader-${suffix}@example.com`);

  const cycle = await leader.post("create_mirror", { scores: [3, 3, 3, 3, 3, 3] });
  const respondents = [];
  for (let index = 0; index < 5; index++) {
    const invite = await leader.post("invite_mirror", { cycleId: cycle.id, email: `person-${index}-${suffix}@example.com` });
    const token = new URL(invite.link).searchParams.get("invite");
    const person = new Visitor();
    assert.equal((await person.get(`/api/app?invite=${token}`)).invite.type, "mirror");
    const joined = await person.post("join", { token });
    const participant = await person.get(`/api/app?company=${joined.companyId}`);
    assert.equal(participant.mirrorRequests.length, 1);
    await person.post("respond_mirror", { companyId: joined.companyId, token, scores: [4, 4, 4, 4, 4, 4] });
    respondents.push({ person, member: participant.membership });
  }
  assert.equal((await leader.get()).mirrors[0].teamScores, null);
  await leader.post("close_mirror", { cycleId: cycle.id });
  const closed = await leader.get();
  assert.equal(closed.mirrors[0].responseCount, 5);
  assert.deepEqual(closed.mirrors[0].teamScores, [4, 4, 4, 4, 4, 4]);
  assert.equal(JSON.stringify(closed.mirrors).includes("respondent_id"), false);
  await leader.post("choose_action", { cycleId: cycle.id, text: "Escutar sem interromper na próxima conversa." });
  assert.equal((await outsider.call("/api/app", { action: "add_action_checkin", cycleId: cycle.id, note: "Tentei ouvir o time inteiro." })).status, 403);
  await leader.post("add_action_checkin", { cycleId: cycle.id, note: "Ouvi uma colega até o fim e entendi melhor o bloqueio." });
  assert.equal((await leader.get()).mirrors[0].checkins[0].action, "Escutar sem interromper na próxima conversa.");
  assert.equal((await leader.call("/api/app", { action: "add_action_checkin", cycleId: cycle.id, note: "Tentei novamente mais tarde." })).status, 409);
  await leader.post("create_mirror", { scores: [2, 3, 4, 2, 3, 4] });
  assert.equal((await leader.get()).mirrors.length, 2);

  const track = await leader.post("create_thermometer", { cycleId: cycle.id, dimensions: [0, 1] });
  assert.equal(track.ok, true);
  const roundId = (await leader.get()).thermometerTracks[0].rounds[0].id;
  for (const { person, member } of respondents) {
    assert.equal((await person.get(`/api/app?company=${member.companyId}`)).thermometerRequests.length, 1);
    await person.post("respond_thermometer", { companyId: member.companyId, roundId, scores: [5, 4] });
  }
  await leader.post("close_thermometer_round", { roundId });
  assert.deepEqual((await leader.get()).thermometerTracks[0].rounds[0].scores, [5, 4]);
  await leader.post("new_thermometer_round", { trackId: (await leader.get()).thermometerTracks[0].id });

  await leader.post("complete_decision", { scenarioId: "erro-entrega", choices: [0, 1, 2] });
  await leader.post("complete_decision", { scenarioId: "feedback-dificil", choices: [1, 0, 2] });
  assert.equal((await leader.get()).runs.length, 2);
  await leader.post("save_career", { choices: [0, 1, 0, 1, 1, 0, 1, 0] });
  assert.equal((await leader.get()).careerRuns.length, 1);
  await leader.post("add_energy", { activity: "Planejamento reservado", activityType: "Planejamento", entryDate: new Date().toISOString().slice(0, 10), energy: 2 });
  assert.equal((await leader.get()).energyEntries.length, 1);

  const memberInvite = await leader.post("invite_member", { email: `team-${suffix}@example.com`, role: "participant" });
  const disposable = await leader.post("invite_member", { email: `cancel-${suffix}@example.com`, role: "participant" });
  const disposableToken = new URL(disposable.link).searchParams.get("invite");
  assert.equal((await leader.get()).pendingInvites.some(invite => invite.token === disposableToken), true);
  await leader.post("revoke_invite", { token: disposableToken });
  assert.equal((await outsider.get(`/api/app?invite=${disposableToken}`)).inviteError, true);
  const memberToken = new URL(memberInvite.link).searchParams.get("invite");
  const participant = new Visitor();
  await participant.get(`/api/app?invite=${memberToken}`);
  const memberJoin = await participant.post("join", { token: memberToken });
  const participantData = await participant.get(`/api/app?company=${memberJoin.companyId}`);
  assert.equal(participantData.membership.role, "participant");
  assert.equal(participantData.user.email, `team-${suffix}@example.com`);
  assert.equal(participantData.people.length, 0);
  const nextCycleId = (await leader.get()).mirrors[0].id;
  const existingMemberInvite = await leader.post("invite_mirror", { cycleId: nextCycleId, email: participantData.user.email });
  const existingMemberToken = new URL(existingMemberInvite.link).searchParams.get("invite");
  assert.equal((await participant.get(`/api/app?company=${memberJoin.companyId}`)).mirrorRequests.some(request => request.token === existingMemberToken), true);
  assert.equal((await participant.call("/api/app", { action: "set_module", companyId: memberJoin.companyId, module: "career", enabled: false })).status, 403);
  await participant.post("add_energy", { companyId: memberJoin.companyId, activity: "Conversa reservada", activityType: "Colaboração", entryDate: new Date().toISOString().slice(0, 10), energy: 1 });
  await participant.post("share_energy", { companyId: memberJoin.companyId, email: `leader-${suffix}@example.com` });
  const shared = (await leader.get()).sharedEnergy;
  assert.equal(shared.length, 1);
  assert.equal(shared[0].total, 1);
  assert.equal(JSON.stringify(shared).includes("Conversa reservada"), false);

  const pairInvite = await leader.post("create_communication", { email: `pair-${suffix}@example.com`, preferences: [0, 1, 0, 1, 0], consent: true });
  const pairToken = new URL(pairInvite.link).searchParams.get("invite");
  assert.equal((await leader.get()).pairs[0].ready, false);
  const partner = new Visitor();
  await partner.get(`/api/app?invite=${pairToken}`);
  const partnerJoin = await partner.post("join", { token: pairToken });
  await partner.post("respond_communication", { companyId: partnerJoin.companyId, token: pairToken, preferences: [1, 1, 0, 0, 0], consent: true });
  const pair = (await leader.get()).pairs[0];
  assert.equal(pair.ready, true);
  assert.equal(pair.preferences.length, 2);
  await leader.post("save_agreement", { pairId: pair.id, agreement: "Confirmar prazos em uma conversa curta." });
  assert.equal((await partner.get(`/api/app?company=${partnerJoin.companyId}`)).pairs[0].agreement, "Confirmar prazos em uma conversa curta.");
  await partner.post("remove_communication", { companyId: partnerJoin.companyId, pairId: pair.id });
  assert.equal((await leader.get()).pairs.length, 0);

  await leader.post("set_module", { module: "decisions", enabled: false });
  assert.equal((await participant.get(`/api/app?company=${memberJoin.companyId}`)).moduleSettings.decisions, false);
  assert.equal((await participant.call("/api/app", { action: "complete_decision", companyId: memberJoin.companyId, scenarioId: "erro-entrega", choices: [0, 0, 0] })).status, 403);
});
