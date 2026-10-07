export type StudyQuestion = { id: string; lessonId: string; scenario?: string; prompt: string; options: string[]; correct: number; explanation: string };
export type StudyLesson = { id: string; title: string; minutes: number; sections: { heading: string; text: string }[]; takeaways: string[]; example: string; application: string; activity: StudyQuestion; additionalActivities?: StudyQuestion[]; final: StudyQuestion };
export type StudyCourse = { id: string; number: string; title: string; description: string; image: string; skill: string; lessons: StudyLesson[]; transfer: StudyQuestion };
