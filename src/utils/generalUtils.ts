import { populateSchedulesAndSelectSlotCombination } from "@/app/reducers/schedules";
import { AppDispatch } from "@/app/store";
import {
  Course,
  ExtendedClassesByCourseID,
  SchedulesBySlotCombination,
} from "@/types";
import { populateSlotCombination } from "./workerUtils";

/**
 *
 * @param {object} course Preferably object containing course info, but any object with "COURSE CODE" and "COURSE TYPE" fields should work.
 * @returns {string} Unique identifier for object passed in by joining courseCode and courseType with a hyphen, eg:- CHY1701-ETH
 */
const getCourseID = (course: {
  "COURSE CODE": string;
  "COURSE TYPE": string;
}) => {
  return `${course["COURSE CODE"]}-${course["COURSE TYPE"]}`;
};

const isProject = (courseIDOrCourse: string | Course) => {
  const courseID =
    typeof courseIDOrCourse === "string"
      ? courseIDOrCourse
      : getCourseID(courseIDOrCourse);
  return courseID.endsWith("PJT") || courseID.endsWith("EPJ");
};

const selectSlots = async (
  selectedClasses: ExtendedClassesByCourseID,
  reservedSlots: Array<string>,
  slotCombinationArray: Array<string>,
  schedules: SchedulesBySlotCombination,
  dispatch: AppDispatch
) => {
  const slotCombinationString = slotCombinationArray.join("+");
  const result = await populateSlotCombination(
    selectedClasses,
    reservedSlots,
    slotCombinationString,
    schedules
  );
  if (slotCombinationArray.length > 0)
    dispatch(
      populateSchedulesAndSelectSlotCombination({
        schedulesArray: result[slotCombinationString],
        slotCombination: slotCombinationArray,
      })
    );
};

const isUnique = <
  T extends {
    [key: string]: any;
  }
>(
  fieldName: string,
  array: Array<T>,
  element: T
) => {
  return !array.some(
    (currentElement) => currentElement[fieldName] === element[fieldName]
  );
};
export { getCourseID, isProject, selectSlots, isUnique };
