import { Schedule } from "@/types";
import timetableTemplateData from "@/utils/timetableTemplateData";
export const getSlotTiming = (slot: string, cellIndex: number) => {
  // timetableTemplateData.forEach(row =>
  //   row.forEach((cell, index) => )
  //   )
  // for (let i = 0; i < timetableTemplateData.length; i++)
  //   for (let j = 0; j < timetableTemplateData[i].length; j++)
  //     if (timetableTemplateData[i][j] === slot) index = j;
  if (slot.startsWith("L"))
    return [
      timetableTemplateData[2][cellIndex],
      timetableTemplateData[3][cellIndex],
    ];
  else
    return [
      timetableTemplateData[0][cellIndex],
      timetableTemplateData[1][cellIndex],
    ];
};

export const getClassBySlotInSchedule = (schedule: Schedule, cell: string) => {
  // console.log(schedule, cell);
  if (schedule === undefined || schedule === null) return null;
  const courseIDs = Object.keys(schedule);
  const courseID = courseIDs?.find((courseID) =>
    schedule[courseID]["SLOT"].split("+").includes(cell)
  );
  if (courseID !== undefined && schedule[courseID] !== undefined) {
    const result = schedule[courseID];
    return result;
  }
  return null;
};

export const getCellContent = (
  schedule: Schedule,
  cell: string,
  slots: Array<string>
) => {
  if (schedule === undefined || schedule === null) return "";
  // console.log(schedule, cell);
  const courseIDs = Object.keys(schedule);
  const courseID = courseIDs.find((courseID) =>
    schedule[courseID]["SLOT"].split("+").includes(cell)
  );
  if (
    schedule === undefined ||
    courseIDs.length === 0 ||
    courseID === undefined ||
    !(
      schedule[courseID] &&
      slots.includes(schedule[courseID]["SLOT"].split("+")[0])
    )
  )
    return cell;
  return `${cell}-${courseID}-${schedule[courseID]["ROOM NUMBER"]}`;
};

export const getClassName = (
  cellContent: string,
  rowIndex: number,
  cellIndex: number,
  slots: Array<string>,
  hoveredSlots: Array<string>,
  styles: CSSModuleClasses,
  dayCount: number
) => {
  let className = `${styles.cell} `;
  if (cellIndex < 2) {
    className += `${styles.headDay}`;
    return className;
  }
  if (rowIndex < 2) {
    className += ` ${styles.theoryTiming} `;
  }
  if (rowIndex >= 2 && rowIndex < 4) {
    className += ` ${styles.labTiming} `;
  }
  if (rowIndex < 4) {
    className += ` ${styles.cell} ${styles.headTop} `;
    return className;
  }
  if (cellContent === "Lunch") {
    className += `${styles.lunch}`;
    return className;
  }
  if (hoveredSlots.includes(cellContent)) {
    if (rowIndex % 2 === 0) {
      className += `${styles.theory} ${styles.hoveredTheory}`;
      return className;
    } else {
      className += `${styles.lab} ${styles.hoveredLab}`;
      return className;
    }
  }
  if (slots.includes(cellContent)) {
    if (rowIndex % 2 === 0) {
      className += `${styles.theory}`;
      return className;
    } else {
      className += `${styles.lab}`;
      return className;
    }
  }
  if (dayCount % 2 === 0) {
    className += `${styles.evenDay}`;
    return className;
  } else {
    className += `${styles.oddDay}`;
    return className;
  }
};

export const getCoursesWithDifferentFaculties = (schedule: Schedule) => {
  const facultiesByCourseCode: {
    [courseCode: string]: string;
  } = {};
  const courseCodes = new Set();
  for (const courseID of Object.keys(schedule)) {
    const courseCode = schedule[courseID]["COURSE CODE"];
    if (facultiesByCourseCode[courseCode] === undefined)
      facultiesByCourseCode[courseCode] = schedule[courseID]["ERP ID"];
    else if (facultiesByCourseCode[courseCode] !== schedule[courseID]["ERP ID"])
      courseCodes.add(courseCode);
  }
  return Array.from(courseCodes);
};
