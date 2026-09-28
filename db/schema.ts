import { integer, sqliteTable, text, uniqueIndex, index } from "drizzle-orm/sqlite-core";

export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  kind: text("kind", { enum: ["organization", "personal"] }).notNull().default("organization"),
  modules: text("modules").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
});
export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin","rh","leader","participant"] }).notNull(),
}, t => [uniqueIndex("idx_members_company_user").on(t.companyId,t.userId), index("idx_members_user").on(t.userId)]);
export const invites = sqliteTable("invites", {
  token: text("token").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  email: text("email").notNull(),
  type: text("type", { enum: ["member","mirror","communication"] }).notNull(),
  role: text("role"),
  referenceId: text("reference_id"),
  expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at"),
  createdAt: text("created_at").notNull(),
}, t => [index("idx_invites_company").on(t.companyId)]);
export const mirrorCycles = sqliteTable("mirror_cycles", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  leaderId: text("leader_id").notNull().references(() => members.id),
  status: text("status", { enum: ["open","closed"] }).notNull(),
  selfScores: text("self_scores").notNull(),
  action: text("action"),
  createdAt: text("created_at").notNull(),
  closedAt: text("closed_at"),
}, t => [index("idx_mirror_leader").on(t.companyId,t.leaderId)]);
export const mirrorResponses = sqliteTable("mirror_responses", {
  id: text("id").primaryKey(),
  cycleId: text("cycle_id").notNull().references(() => mirrorCycles.id),
  respondentId: text("respondent_id").notNull().references(() => members.id),
  scores: text("scores").notNull(),
  createdAt: text("created_at").notNull(),
}, t => [uniqueIndex("idx_mirror_response_unique").on(t.cycleId,t.respondentId)]);
export const mirrorActionCheckins = sqliteTable("mirror_action_checkins", {
  id: text("id").primaryKey(),
  cycleId: text("cycle_id").notNull().references(() => mirrorCycles.id),
  action: text("action").notNull(),
  note: text("note").notNull(),
  entryDate: text("entry_date").notNull(),
  createdAt: text("created_at").notNull(),
}, t => [uniqueIndex("idx_mirror_checkin_day").on(t.cycleId,t.entryDate)]);
export const decisionRuns = sqliteTable("decision_runs", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  memberId: text("member_id").notNull().references(() => members.id),
  scenarioId: text("scenario_id").notNull(),
  choices: text("choices").notNull(),
  createdAt: text("created_at").notNull(),
}, t => [index("idx_decision_member").on(t.companyId,t.memberId)]);
export const communicationPairs = sqliteTable("communication_pairs", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  creatorId: text("creator_id").notNull().references(() => members.id),
  partnerEmail: text("partner_email").notNull(),
  partnerId: text("partner_id"),
  status: text("status", { enum: ["pending","ready","removed"] }).notNull(),
  agreement: text("agreement").notNull().default(""),
  createdAt: text("created_at").notNull(),
}, t => [index("idx_comm_company").on(t.companyId)]);
export const communicationResponses = sqliteTable("communication_responses", {
  id: text("id").primaryKey(),
  pairId: text("pair_id").notNull().references(() => communicationPairs.id),
  memberId: text("member_id").notNull().references(() => members.id),
  preferences: text("preferences").notNull(),
  consent: integer("consent", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").notNull(),
}, t => [uniqueIndex("idx_comm_response_unique").on(t.pairId,t.memberId)]);

export const energyEntries = sqliteTable("energy_entries", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  memberId: text("member_id").notNull().references(() => members.id),
  entryDate: text("entry_date").notNull(),
  activityType: text("activity_type").notNull(),
  activity: text("activity").notNull(),
  energy: integer("energy").notNull(),
  createdAt: text("created_at").notNull(),
}, t => [index("idx_energy_member_date").on(t.companyId,t.memberId,t.entryDate)]);
export const energyShares = sqliteTable("energy_shares", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  memberId: text("member_id").notNull().references(() => members.id),
  leaderId: text("leader_id").notNull().references(() => members.id),
  createdAt: text("created_at").notNull(),
}, t => [uniqueIndex("idx_energy_share_unique").on(t.memberId,t.leaderId)]);
export const careerRuns = sqliteTable("career_runs", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  memberId: text("member_id").notNull().references(() => members.id),
  choices: text("choices").notNull(),
  createdAt: text("created_at").notNull(),
}, t => [index("idx_career_member").on(t.companyId,t.memberId)]);
export const thermometerTracks = sqliteTable("thermometer_tracks", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  leaderId: text("leader_id").notNull().references(() => members.id),
  cycleId: text("cycle_id").notNull().references(() => mirrorCycles.id),
  dimensions: text("dimensions").notNull(),
  createdAt: text("created_at").notNull(),
}, t => [uniqueIndex("idx_thermometer_cycle").on(t.cycleId)]);
export const thermometerRounds = sqliteTable("thermometer_rounds", {
  id: text("id").primaryKey(),
  trackId: text("track_id").notNull().references(() => thermometerTracks.id),
  status: text("status", { enum: ["open","closed"] }).notNull(),
  createdAt: text("created_at").notNull(),
  closedAt: text("closed_at"),
}, t => [index("idx_thermometer_round_track").on(t.trackId)]);
export const thermometerResponses = sqliteTable("thermometer_responses", {
  id: text("id").primaryKey(),
  roundId: text("round_id").notNull().references(() => thermometerRounds.id),
  respondentId: text("respondent_id").notNull().references(() => members.id),
  scores: text("scores").notNull(),
  createdAt: text("created_at").notNull(),
}, t => [uniqueIndex("idx_thermometer_response_unique").on(t.roundId,t.respondentId)]);
