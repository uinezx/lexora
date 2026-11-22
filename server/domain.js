// Server-side domain rules. A verified server session must supply actor;
// never construct it from a browser role or an unverified Telegram payload.
export class AccessError extends Error {}
export function approveTeacher(actor, applicant) {
  if (!actor?.id || actor.role!=='admin' || actor.status!=='active') throw new AccessError('Active admin required');
  if (!applicant?.id || applicant.status!=='pending' || applicant.role!=='teacher') throw new AccessError('Pending teacher application required');
  return {...applicant,status:'active'};
}
export function requireTeacher(actor) {
  if (!actor?.id || actor.role !== 'teacher' || actor.status !== 'active') throw new AccessError('Active teacher account required');
}
export function requireGroupOwner(actor, group) {
  requireTeacher(actor);
  if (!group || group.teacherId !== actor.id) throw new AccessError('Group owner required');
}
export function requireStudentMember(actor, groupId, membership) {
  if (!actor?.id || actor.role !== 'student' || actor.status !== 'active' || membership?.studentId !== actor.id || membership?.groupId !== groupId || membership?.status !== 'active') throw new AccessError('Active group membership required');
}
export function authorizeTaskCreation(actor, group) { requireGroupOwner(actor, group); }
export function authorizeWordCreation(actor, group) { requireGroupOwner(actor, group); }
export function authorizeSubmission(actor, task, membership) {
  if (!task || task.status !== 'published') throw new AccessError('Published task required');
  requireStudentMember(actor, task.groupId, membership);
}
// Provisional task-level balance. Vocabulary CEFR level does not affect XP.
export const XP_POLICY = Object.freeze({
  vocabulary: Object.freeze({foundation:15,standard:25,challenge:35}),
  spelling: Object.freeze({foundation:20,standard:30,challenge:40}),
  grammar: Object.freeze({foundation:20,standard:35,challenge:50}),
  reading: Object.freeze({foundation:25,standard:40,challenge:60}),
  listening: Object.freeze({foundation:25,standard:40,challenge:60}),
  writing: Object.freeze({foundation:35,standard:55,challenge:80}),
  speaking: Object.freeze({foundation:30,standard:50,challenge:75})
});
export function calculateTaskXP({type,difficulty,scorePercent,completed,reviewStatus}) {
  const base=XP_POLICY[type]?.[difficulty];
  if (!base || !Number.isFinite(scorePercent) || scorePercent<0 || scorePercent>100) throw new RangeError('Invalid task result');
  if (!completed) return 0;
  if (['speaking','writing'].includes(type) && reviewStatus!=='approved') return 0;
  // Incomplete/low-quality submissions do not get a completion reward.
  if (scorePercent<50) return 0;
  return Math.round(base*(scorePercent<70?.6:scorePercent<90?.8:1));
}
export function xpUpgrade(previousAward, result) {
  if (!Number.isInteger(previousAward)||previousAward<0) throw new RangeError('Invalid previous award');
  const total=calculateTaskXP(result);
  return {total:Math.max(previousAward,total),delta:Math.max(0,total-previousAward)};
}
export function validateGroupName(name) {
  if(typeof name!=='string')throw new TypeError('Group name required');
  const value=name.trim();
  if(value.length<3||value.length>80)throw new RangeError('Group name must be 3–80 characters');
  return value;
}
export function validJoinCode(code) { return typeof code==='string' && /^[1-9]\d{4}$/.test(code); }
export function joinGroup(actor, code, group, existingMembership) {
  if (!actor?.id || actor.role!=='student' || actor.status!=='active') throw new AccessError('Active student required');
  if (!validJoinCode(code) || !group || group.archived || group.joinCode!==code) throw new AccessError('Invalid or unavailable group code');
  if (existingMembership?.studentId===actor.id && existingMembership?.groupId===group.id && existingMembership.status==='removed') throw new AccessError('Ask the teacher to restore membership');
  return {groupId:group.id,studentId:actor.id,status:'active'};
}
