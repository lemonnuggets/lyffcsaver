import type {
  ExtendedClass,
  ExtendedClassesByCourseID,
  Schedule,
  SlotMapping,
} from "@/types";
import { getCourseID } from "@/utils/generalUtils";
import { expose } from "comlink";

/// <reference lib="webworker" />

type Selection = { [courseID: string]: ExtendedClass };
type SlotCombinationToSelections = {
  [slotCombination: string]: Array<Selection>;
};

/**
 *
 * @param selection Course ID mapped to the class selected for that course
 * @returns An array containing all the slots in the selection
 */
const getSlots = (selection: Selection) => {
  const classes = Object.values(selection);
  const slots: Array<string> = [];
  classes
    .map((currentClass) => currentClass["SLOT"].split("+"))
    .forEach((classSlots) => {
      slots.push(...classSlots);
    });

  return slots;
};

/**
 * Checks if the selection is possible or not. A selection is possible if the
 * slots in the selection do not overlap with each other.
 *
 * @param selection Course ID mapped to the class selected for that course
 * @param courseID
 * @param mapping Mapping of slots to equivalent slots
 * @returns Whether the selection is possible or not
 */
const isPossible = (
  selection: Selection,
  courseID: string,
  mapping: SlotMapping
) => {
  const allSlots = getSlots(selection);
  const allSlotsSet = new Set(allSlots);
  if (allSlots.length > allSlotsSet.size) return false;

  const slotsToBeChecked = getSlots({ courseID: selection[courseID] });
  for (const slot of slotsToBeChecked) {
    const equivalentSlots = mapping[slot];
    if (equivalentSlots === undefined) continue;
    for (const equivalentSlot of equivalentSlots) {
      if (allSlots.includes(equivalentSlot)) return false;
    }
  }
  return true;
};

/**
 * Selects classes for the courses in the courseIDs array.
 *
 * @param courseIDs Array of course IDs to be selected
 * @param classes CourseID mapped to an array of classes available for that course
 * @param mapping Mapping of slots to equivalent slots
 * @param selection Course ID mapped to the class selected for that course
 * @returns Mapping of slot combinations to an array of selections that have those slots
 */
export const selectClasses = (
  courseIDs: Array<string>,
  classes: ExtendedClassesByCourseID,
  mapping: SlotMapping,
  selection: Selection = {}
) => {
  if (courseIDs.length === 0) {
    const slots = [...new Set(getSlots(selection))];
    slots.sort();
    const key = slots.join("+");
    const result = { [key]: [selection] };
    return result;
  }

  const courseID = courseIDs[0];
  if (selection[courseID] !== undefined) return {};
  const allResults: SlotCombinationToSelections = {};
  for (const currentClass of classes[courseID]) {
    selection[courseID] = currentClass;

    // only checking if the change that was made
    // is possible.
    if (!isPossible(selection, courseID, mapping)) continue;
    const results = selectClasses(
      courseIDs.slice(1),
      classes,
      mapping,
      Object.assign({}, selection)
    );
    for (const resultArray of Object.values(results)) {
      for (const result of resultArray) {
        const slots = [...new Set(getSlots(result))];
        slots.sort();
        const key = slots.join("+");
        if (allResults[key] === undefined) allResults[key] = [];
        allResults[key].push(result);
      }
    }
  }
  return allResults;
};

/**
 *
 * @param slotsToBeChecked Array of slots to be checked
 * @param slotsArraysToBeCheckedWith Array of arrays of slots to be checked with
 * @returns Whether the slotsToBeChecked array is present in the slotsArraysToBeCheckedWith array
 */
const slotsAlreadyConsidered = (
  slotsToBeChecked: Array<string>,
  slotsArraysToBeCheckedWith: Array<Array<string>>
) => {
  let equalArrayExists = false;
  const filteredSlotsArrays = slotsArraysToBeCheckedWith.filter(
    (slots) => slots.length === slotsToBeChecked.length
  );
  for (const slotsArray of filteredSlotsArrays) {
    let equalArrays = true;
    for (const slot of slotsArray) {
      if (
        slotsToBeChecked.find((slotToBeChecked) => slotToBeChecked === slot) ===
        undefined
      ) {
        equalArrays = false;
        break;
      }
    }
    if (equalArrays) {
      equalArrayExists = true;
      break;
    }
  }
  return equalArrayExists;
};

/**
 *
 * @param slotsA Array of slots to be checked
 * @param slotsB Array of slots to be checked with
 * @param mapping Mapping of slots to equivalent slots
 * @returns Whether the slots in slotsA and slotsB conflict with each other
 */
const slotConflict = (
  slotsA: Array<string>,
  slotsB: Array<string>,
  mapping: SlotMapping
) => {
  for (const slotA of slotsA) {
    const equivalentSlotsA = mapping[slotA];
    if (equivalentSlotsA === undefined) continue;
    for (const slotB of slotsB) {
      if (slotA === slotB) return true;
      const equivalentSlotsB = mapping[slotB];
      if (equivalentSlotsB === undefined) continue;
      for (const equivalentSlotA of equivalentSlotsA) {
        for (const equivalentSlotB of equivalentSlotsB) {
          if (
            // equivalentSlotA === equivalentSlotB ||
            slotA === equivalentSlotB ||
            slotB === equivalentSlotA
          )
            return true;
        }
      }
    }
  }
  return false;
};

/**
 *
 * @param courseIDs Array of course IDs to be selected for
 * @param classes CourseID mapped to an array of classes available for that course
 * @param mapping Mapping of slots to equivalent slots
 * @param combinations Array of slot combinations
 * @returns Array of slot combinations
 */
export const getSlotCombinations = (
  courseIDs: Array<string>,
  classes: ExtendedClassesByCourseID,
  mapping: SlotMapping,
  combinations: Array<Array<string>> = []
) => {
  if (courseIDs.length === 0) {
    return combinations;
  }
  const courseID = courseIDs[0];
  const newCombinations = [];
  if (combinations.length === 0) {
    for (const currentClass of classes[courseID]) {
      if (
        getCourseID(currentClass) === courseID &&
        !slotsAlreadyConsidered(currentClass["SLOT"].split("+"), combinations)
      )
        newCombinations.push(currentClass["SLOT"].split("+").sort());
    }
  } else {
    for (const baseSlots of combinations) {
      for (const currentClass of classes[courseID]) {
        if (getCourseID(currentClass) !== courseID) continue;
        const slotsToBeAdded = currentClass["SLOT"].split("+");

        if (slotConflict(slotsToBeAdded, baseSlots, mapping)) continue;
        const newCombination = [...slotsToBeAdded, ...baseSlots];

        if (slotsAlreadyConsidered(newCombination, newCombinations)) continue;
        newCombination.sort();
        newCombinations.push(newCombination);
      }
    }
  }
  const result: Array<Array<string>> = getSlotCombinations(
    courseIDs.slice(1),
    classes,
    mapping,
    newCombinations
  );
  // console.log(result, courseIDs.slice(1), classes, mapping, newCombinations);
  return result;
};

/**
 *
 * @param arrayToBeTested  Array to be tested
 * @param testingArray  Array to be tested with
 * @returns  Whether all elements in arrayToBeTested are present in testingArray
 */
const allElementsWithinArray = <T>(
  arrayToBeTested: Array<T>,
  testingArray: Array<T>
) => {
  return (
    arrayToBeTested.find((element) => !testingArray.includes(element)) ===
    undefined
  );
};

const getScheduleID = (schedule: Schedule) => {
  let scheduleID = "";
  for (const courseID of Object.keys(schedule)) {
    scheduleID +=
      schedule[courseID]["CLASS ID"] +
      // schedule[courseID]["ASSOCIATED CLASS ID"] +
      "-";
  }
  return scheduleID;
};

const findEquivalentSchedules = (
  courseIDs: Array<string>,
  classes: ExtendedClassesByCourseID,
  schedule: Schedule
) => {
  const scheduleCopy: Schedule = JSON.parse(JSON.stringify(schedule));
  if (courseIDs.length === 0) return [scheduleCopy];

  const courseID = courseIDs[0];
  const slot = scheduleCopy[courseID]["SLOT"];
  const allSimilarSchedules = [];

  const filteredClasses = classes[courseID].filter(
    (testingClass) => testingClass["SLOT"] === slot
  );

  for (const similarClass of filteredClasses) {
    scheduleCopy[courseID] = similarClass;
    allSimilarSchedules.push(scheduleCopy);
    const similarSchedules: Array<Schedule> = findEquivalentSchedules(
      courseIDs.slice(1),
      classes,
      scheduleCopy
    );
    allSimilarSchedules.push(...similarSchedules);
  }
  return allSimilarSchedules;
};

/**
 *
 * @param courseIDs Course IDs to be selected for
 * @param classes CourseID mapped to an array of classes available for that course
 * @param slotCombinationString Slot combination string to be populated
 * @param mapping Mapping of slots to equivalent slots
 * @param possibleSlotCombinations Object of slot combinations mapped to an array of schedules
 * @returns Object of slot combinations mapped to an array of schedules
 */
export const populateSlotCombination = (
  courseIDs: Array<string>,
  classes: ExtendedClassesByCourseID,
  slotCombinationString: string,
  mapping: SlotMapping,
  possibleSlotCombinations: {
    [slotCombinationString: string]: Array<Schedule>;
  } = {}
) => {
  // if (possibleSlotCombinations[slotCombinationString] === undefined)
  //   return possibleSlotCombinations;
  const allowedSlots = slotCombinationString.split("+");
  const classesCopy: ExtendedClassesByCourseID = JSON.parse(
    JSON.stringify(classes)
  );

  // filtering out all classes that don't match the required slots
  for (const courseID of courseIDs) {
    classesCopy[courseID] = classesCopy[courseID].filter((classToBeChecked) =>
      allElementsWithinArray(classToBeChecked["SLOT"].split("+"), allowedSlots)
    );
  }

  const similarClasses: {
    [courseID: string]: { [slot: string]: Array<ExtendedClass> };
  } = {};

  // Adding and grouping similar classes together in similarClasses
  for (const courseID of courseIDs) {
    similarClasses[courseID] = {};
    for (const classToBeAdded of classesCopy[courseID]) {
      const slot = classToBeAdded["SLOT"];
      if (similarClasses[courseID][slot] === undefined)
        similarClasses[courseID][slot] = [];
      similarClasses[courseID][slot].push(classToBeAdded);
    }
  }

  const uniqueClasses: {
    [courseID: string]: Array<ExtendedClass>;
  } = {};
  // Taking unique class from similarClasses and adding to unique classes
  for (const courseID of courseIDs) {
    uniqueClasses[courseID] = [];
    for (const slot of Object.keys(similarClasses[courseID])) {
      const classToBeAdded = similarClasses[courseID][slot].pop();
      if (classToBeAdded !== undefined)
        uniqueClasses[courseID].push(classToBeAdded);
    }
  }

  const possibleClassSelections = selectClasses(
    courseIDs,
    uniqueClasses,
    mapping
  );
  const newSchedules: Array<Schedule> = [];
  const scheduleIDs = new Set();
  const addSchedules = (...schedules: Array<Schedule>) => {
    for (const schedule of schedules) {
      const scheduleID = getScheduleID(schedule);
      const previousSize = scheduleIDs.size;
      scheduleIDs.add(scheduleID);
      if (scheduleIDs.size > previousSize) newSchedules.push(schedule);
    }
  };
  if (
    possibleClassSelections[slotCombinationString] !== undefined &&
    possibleClassSelections[slotCombinationString] !== null
  )
    for (const schedule of possibleClassSelections[slotCombinationString]) {
      addSchedules(schedule);
      addSchedules(...findEquivalentSchedules(courseIDs, classes, schedule));
    }
  possibleSlotCombinations[slotCombinationString] = newSchedules;
  return possibleSlotCombinations;
};

expose({
  getSlotCombinations,
  populateSlotCombination,
  selectClasses,
});
