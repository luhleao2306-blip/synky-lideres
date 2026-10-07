import test from 'node:test';
import assert from 'node:assert/strict';
import { allStudyLessons, finalStudyQuestions, FINAL_QUIZ_ID, historicalStudyQuestions, studyCourses, studyPractices, studyQuiz } from './academy-curriculum.ts';
import { attemptStudyQuestions, courseCompleted, emptyStudyProgress, isCurrentStudyAttempt, scoreStudyQuiz, quizUnlocked, parseStudyProgress, studyStorageKey } from './academy-model.ts';
const answers = id => Object.fromEntries(studyQuiz(id).questions.map(q => [q.id,q.correct]));
const attempt = (id,quizId,input=answers(quizId)) => ({id,quizId,at:'2026-10-07T12:00:00Z',answers:input,questionIds:studyQuiz(quizId).questions.map(q=>q.id),...scoreStudyQuiz(quizId,input)});
const allPractices = () => studyPractices.map(p=>attempt(p.id,p.id));
test('eight courses, forty deepened lessons, twenty activities and twenty exam questions per course',()=>{
 assert.equal(studyCourses.length,8);assert.equal(allStudyLessons.length,40);assert.equal(finalStudyQuestions.length,20);
 for(const course of studyCourses){const practices=studyPractices.filter(p=>p.courseId===course.id);assert.equal(practices.length,20);assert.equal(practices.filter(p=>p.kind==='case').length,5);assert.equal(studyQuiz(course.id).questions.length,20);for(const p of practices)assert.equal(p.questions.length,p.kind==='case'?4:2);for(const l of course.lessons){assert.ok(l.sections.length>=5);assert.equal(practices.filter(p=>p.lessonId===l.id).length,4);}}
 const exams=[...finalStudyQuestions,...studyCourses.flatMap(c=>studyQuiz(c.id).questions)];
 for(const q of exams){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(allStudyLessons.some(l=>l.id===q.lessonId));assert.ok(q.scenario.length>100);assert.ok(q.correct>=0&&q.correct<4);assert.ok(q.explanation.length>30);}
 assert.equal(new Set(exams.map(q=>q.id)).size,exams.length);assert.equal(new Set(finalStudyQuestions.map(q=>studyCourses.find(c=>c.lessons.some(l=>l.id===q.lessonId)).id)).size,8);
});
test('scores derive from complete valid answers, including zero and partial success',()=>{
 assert.deepEqual(scoreStudyQuiz('decisoes',answers('decisoes')),{correct:20,total:20,grade:10});
 const wrong=Object.fromEntries(studyQuiz('decisoes').questions.map(q=>[q.id,(q.correct+1)%4]));assert.equal(scoreStudyQuiz('decisoes',wrong).grade,0);
 const first=studyQuiz('decisoes').questions[0];assert.equal(scoreStudyQuiz('decisoes',{...answers('decisoes'),[first.id]:(first.correct+1)%4}).grade,9.5);
 assert.throws(()=>scoreStudyQuiz('decisoes',{}));assert.throws(()=>scoreStudyQuiz('unknown',{}));assert.throws(()=>scoreStudyQuiz('decisoes',{...answers('decisoes'),[first.id]:4}));
});
test('studying only is insufficient; all current course practices must be submitted',()=>{
 const p=emptyStudyProgress(),practice=studyPractices[0];assert.equal(quizUnlocked(p,practice.id),false);p.studied=[practice.lessonId];assert.equal(quizUnlocked(p,practice.id),true);
 p.studied=allStudyLessons.map(l=>l.id);assert.equal(quizUnlocked(p,'decisoes'),false);
 p.attempts=allPractices().filter(a=>studyPractices.find(x=>x.id===a.quizId).courseId==='decisoes');assert.equal(quizUnlocked(p,'decisoes'),true);assert.equal(quizUnlocked(p,'mudancas'),false);p.attempts.pop();assert.equal(quizUnlocked(p,'decisoes'),false);
});
test('final requires all lessons, current practices and latest course grades of at least eight',()=>{
 const p={...emptyStudyProgress(),studied:allStudyLessons.map(l=>l.id),attempts:allPractices()};assert.equal(quizUnlocked(p,FINAL_QUIZ_ID),false);
 p.attempts.push(...studyCourses.map(c=>attempt('exam:'+c.id,c.id)));assert.equal(quizUnlocked(p,FINAL_QUIZ_ID),true);assert.equal(courseCompleted(p,'decisoes'),true);
 const below=answers('decisoes');for(const q of studyQuiz('decisoes').questions.slice(0,5))below[q.id]=(q.correct+1)%4;p.attempts.push(attempt('retry','decisoes',below));assert.equal(quizUnlocked(p,FINAL_QUIZ_ID),false);
 const passing=answers('decisoes');for(const q of studyQuiz('decisoes').questions.slice(0,4))passing[q.id]=(q.correct+1)%4;p.attempts.push(attempt('pass','decisoes',passing));assert.equal(quizUnlocked(p,FINAL_QUIZ_ID),true);p.studied.pop();assert.equal(quizUnlocked(p,FINAL_QUIZ_ID),false);
});
test('historical question sets preserve notes and corrections without satisfying new requirements',()=>{
 const p=emptyStudyProgress();for(const [quizId,sets] of Object.entries(historicalStudyQuestions))for(const [i,qs] of sets.entries())p.attempts.push({id:quizId+':'+i,quizId,at:'2026-10-02T12:00:00Z',answers:Object.fromEntries(qs.map(q=>[q.id,q.correct])),grade:0,correct:0,total:0});
 const restored=parseStudyProgress(JSON.stringify(p));for(const a of restored.attempts){assert.equal(a.grade,10);assert.equal(attemptStudyQuestions(a).length,a.total);assert.equal(isCurrentStudyAttempt(a),false);}assert.equal(quizUnlocked({...restored,studied:allStudyLessons.map(l=>l.id)},'decisoes'),false);
});
test('legacy drafts, current answers and scoped storage round-trip',()=>{
 const old=historicalStudyQuestions.decisoes[0][0],p={...emptyStudyProgress(),studied:['criterios'],bookmarks:['criterios'],drafts:{decisoes:{[old.id]:old.correct,[studyQuiz('decisoes').questions[0].id]:0}},attempts:[attempt('first','decisoes')],updatedAt:'2026-10-07T12:00:00Z'};
 assert.deepEqual(parseStudyProgress(JSON.stringify(p)),p);assert.notEqual(studyStorageKey('a','b:c'),studyStorageKey('a:b','c'));assert.notEqual(studyStorageKey('a','b'),studyStorageKey('a','c'));
});
test('malformed, partial and mixed-version histories cannot overwrite stored progress silently',()=>{
 assert.throws(()=>parseStudyProgress('{'));assert.throws(()=>parseStudyProgress(JSON.stringify({...emptyStudyProgress(),studied:['unknown']})));
 const valid=attempt('first','decisoes'),partial={...valid,answers:{...valid.answers},questionIds:[...valid.questionIds]};delete partial.answers[partial.questionIds.pop()];
 assert.throws(()=>parseStudyProgress(JSON.stringify({...emptyStudyProgress(),attempts:[partial]})));assert.throws(()=>parseStudyProgress(JSON.stringify({...emptyStudyProgress(),attempts:[valid,valid]})));assert.throws(()=>parseStudyProgress(JSON.stringify({...emptyStudyProgress(),drafts:{decisoes:{[valid.questionIds[0]]:9}}})));
});
