import test from "node:test";
import assert from "node:assert/strict";
import { calculateMirrorAggregate, comparePreferences, mirrorHighlights } from "../lib/results.ts";
import { scenarios, decisionFeedback } from "../lib/experiences.ts";

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
  assert.equal(scenarios.length,3);
  for(const scenario of scenarios){
    assert.equal(scenario.scenes.length,3);
    assert.ok(scenario.scenes.every(scene=>scene.choices.length>=2));
    assert.equal(decisionFeedback(scenario.id,[0,0,0])?.length,3);
    assert.equal(decisionFeedback(scenario.id,[99,0,0]),null);
  }
});
