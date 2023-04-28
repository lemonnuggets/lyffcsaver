export type CourseType = "ETH" | "ELA" | "EPJ" | "TH" | "LO";
export type Course = {
  "COURSE CODE": string;
  "COURSE TITLE": string;
  "COURSE TYPE": string;
  CREDITS: number;
  "COURSE ID": string;
};
export type Class = {
  "ERP ID": string;
  "COURSE CODE": string;
  "CLASS ID": string;
  SLOT: string;
  "COURSE TYPE": string;
  "ROOM NUMBER": string;
  BATCH: string;
};
export type ExtendedClass = Class & {
  "EMPLOYEE NAME": string;
  "COURSE TITLE": string;
};
export type Faculty = {
  "ERP ID": string;
  "EMPLOYEE NAME": string;
};
export type AllClassData = Class & Course & Faculty;
export type Schedule = {
  [courseID: string]: ExtendedClass;
};
export type ClassesByCourseID = {
  [courseId: string]: Array<Class>;
};
export type ExtendedClassesByCourseID = {
  [courseId: string]: Array<ExtendedClass>;
};
export type SchedulesBySlotCombination = {
  [slotCombination: string]: Array<Schedule>;
};
export type SlotMapping = { [slot: string]: Array<string> };
