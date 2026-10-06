import test from 'node:test';
import assert from 'node:assert/strict';
import { allStudyLessons, finalStudyQuestions, FINAL_QUIZ_ID, studyCourses, studyQuiz } from './academy-curriculum.ts';
import { emptyStudyProgress, scoreStudyQuiz, quizUnlocked, parseStudyProgress, studyStorageKey, latestStudyAttempt } from './academy-model.ts';
const answers = id => Object.fromEntries(studyQuiz(id).questions.map(q=>[q.id,q.correct]));
const attempt = (id,quizId,input=answers(quizId))=>({id,quizId,at:'2026-10-02T12:00:00Z',answers:input,...scoreStudyQuiz(quizId,input)});
test('expanded curriculum has forty lessons and final questions linked to studied content',()=>{
 assert.equal(studyCourses.length,8);assert.equal(allStudyLessons.length,40);assert.equal(finalStudyQuestions.length,40);
 for(const course of studyCourses){assert.equal(course.lessons.length,5);assert.equal(studyQuiz(course.id).questions.length,16);}
 for(const q of [...finalStudyQuestions,...studyCourses.flatMap(c=>studyQuiz(c.id).questions)]){assert.equal(q.options.length,4);assert.ok(allStudyLessons.some(l=>l.id===q.lessonId));assert.ok(q.correct>=0&&q.correct<4);assert.ok(q.explanation.length>20);}
});
test('scores are actual submitted answers and zero is valid',()=>{
 assert.deepEqual(scoreStudyQuiz('decisoes',answers('decisoes')),{correct:16,total:16,grade:10});
 const wrong=Object.fromEntries(studyQuiz('decisoes').questions.map(q=>[q.id,(q.correct+1)%4]));assert.equal(scoreStudyQuiz('decisoes',wrong).grade,0);
 const oneWrong={...answers('decisoes'),[studyQuiz('decisoes').questions[0].id]:0};assert.equal(scoreStudyQuiz('decisoes',oneWrong).grade,9.4);
 assert.throws(()=>scoreStudyQuiz('decisoes',{}));assert.throws(()=>scoreStudyQuiz('unknown',{}));
});
test('final requires all studies and latest passing activity attempts',()=>{
 const p=emptyStudyProgress();assert.equal(quizUnlocked(p,'decisoes'),false);assert.equal(quizUnlocked(p,FINAL_QUIZ_ID),false);
 p.studied=allStudyLessons.map(l=>l.id);assert.equal(quizUnlocked(p,'decisoes'),true);assert.equal(quizUnlocked(p,FINAL_QUIZ_ID),false);
 p.attempts=studyCourses.map(c=>attempt(c.id,c.id));assert.equal(quizUnlocked(p,FINAL_QUIZ_ID),true);
 const wrong=Object.fromEntries(studyQuiz('decisoes').questions.map(q=>[q.id,(q.correct+1)%4]));p.attempts.push(attempt('retry','decisoes',wrong));assert.equal(quizUnlocked(p,FINAL_QUIZ_ID),false);assert.equal(latestStudyAttempt(p,'decisoes').grade,0);
 p.attempts.push(attempt('pass','decisoes'));assert.equal(quizUnlocked(p,FINAL_QUIZ_ID),true);assert.equal(p.attempts.length,10);
});
test('storage isolates people and companies and restores drafts, bookmarks, history',()=>{
 assert.notEqual(studyStorageKey('a','b:c'),studyStorageKey('a:b','c'));assert.notEqual(studyStorageKey('a','b'),studyStorageKey('a','c'));
 const p={...emptyStudyProgress(),studied:['criterios'],bookmarks:['criterios'],drafts:{decisoes:{[studyQuiz('decisoes').questions[0].id]:0}},attempts:[attempt('first','decisoes')],updatedAt:'2026-10-02T12:00:00Z'};
 assert.deepEqual(parseStudyProgress(JSON.stringify(p)),p);
 const forged={...p,attempts:[{...p.attempts[0],grade:0}]};assert.equal(parseStudyProgress(JSON.stringify(forged)).attempts[0].grade,10);
});
test('invalid storage never silently converts to empty or accepts malformed choices',()=>{
 assert.throws(()=>parseStudyProgress('{'));assert.throws(()=>parseStudyProgress(JSON.stringify({...emptyStudyProgress(),studied:['unknown']})));
 assert.throws(()=>parseStudyProgress(JSON.stringify({...emptyStudyProgress(),drafts:{decisoes:{[studyQuiz('decisoes').questions[0].id]:9}}})));
 assert.throws(()=>parseStudyProgress(JSON.stringify({...emptyStudyProgress(),attempts:[attempt('same','decisoes'),attempt('same','decisoes')]})));
});
