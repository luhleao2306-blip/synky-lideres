import test from "node:test";
import assert from "node:assert/strict";
import { calculateMirrorAggregate, comparePreferences, mirrorHighlights } from "../lib/results.ts";
import { scenarios, decisionFeedback } from "../lib/experiences.ts";
import { careerPriorities, summarizeEnergy } from "../lib/additional-experiences.ts";

test("mirror hides an open or undersized cycle", () => {
  const five = Array.from({length:5},()=>[4,3,null,5,2,4]);
  assert.equal(calculateMirrorAggregate("open",five,6),null);
  assert.equal(calculateMirrorAggregate("closed",five.slice(0,4),6),null);
  assert.deepEqual(calculateMirrorAggregate("closed",five,6),[4,3,null,5,2,4]);
  assert.deepEqual(calculateMirrorAggregate("closed",[[4],[4],[4],[4],[null]],1),[null]);
});
test("communication comparison marks each agreement and difference",()=>{
  assert.deepEqual(comparePreferences([0,1,0],[0,0,1]).map(x=>x.match),[true,false,false]);
});
test("mirror highlights use comparable scores and ignore missing team answers",()=>{
  const highlights=mirrorHighlights([4,3,5],[4.1,null,2]);
  assert.equal(highlights.agreement?.index,0);
  assert.equal(highlights.gap?.index,2);
  assert.equal(highlights.gap?.difference,3);
  assert.deepEqual(mirrorHighlights([4,3],[null,null]),{agreement:null,gap:null});
});
test("all scenarios have three playable stages and deterministic feedback",()=>{
  assert.equal(scenarios.length,6);
  for(const scenario of scenarios){
    assert.equal(scenario.scenes.length,3);
    assert.ok(scenario.scenes.every(scene=>scene.choices.length>=2));
    assert.equal(decisionFeedback(scenario.id,[0,0,0])?.length,3);
    assert.equal(decisionFeedback(scenario.id,[99,0,0]),null);
  }
});
test("energy summary keeps only categories and daily averages",()=>{
  const summary=summarizeEnergy([{entryDate:"2026-09-24",activityType:"Reuniões",energy:-1},{entryDate:"2026-09-24",activityType:"Reuniões",energy:1},{entryDate:"2026-09-25",activityType:"Foco individual",energy:2}]);
  assert.equal(summary.total,3);
  assert.deepEqual(summary.categories.map(item=>[item.type,item.average]),[["Reuniões",0],["Foco individual",2]]);
  assert.deepEqual(summary.days.map(item=>item.average),[0,2]);
});
test("career result needs all eight choices and preserves mixed priorities",()=>{
  assert.equal(careerPriorities([0,1]),null);
  const result=careerPriorities([0,1,0,1,1,1,0,0]);
  assert.equal(result?.length,4);
  assert.equal(result?.[0].mixed,true);
  assert.equal(result?.[1].rightCount,2);
});
