import {
  Class,
  ClassesByCourseID,
  ExtendedClassesByCourseID,
  Schedule,
  SchedulesBySlotCombination,
  SlotMapping,
} from "@/types";
import timetableTemplateData from "./timetableTemplateData";

const getSlotMapping = () => {
  const mapping: SlotMapping = {};
  const data = timetableTemplateData;
  for (let rowNo = 4; rowNo + 1 < data.length; rowNo += 2) {
    for (let colNo = 2; colNo < data[rowNo].length; colNo++) {
      const pattern = /[A-Z]+\d+/;
      const slotA = data[rowNo][colNo];
      const slotB = data[rowNo + 1][colNo];
      if (pattern.test(slotA) && pattern.test(slotB)) {
        if (mapping[slotA] === undefined) mapping[slotA] = [];
        if (mapping[slotB] === undefined) mapping[slotB] = [];
        mapping[slotA].push(slotB);
        mapping[slotB].push(slotA);
      }
    }
  }
  return mapping;
};

const removeReservedSlots = (
  classes: ExtendedClassesByCourseID,
  reservedSlots: Array<string>
) => {
  const newClasses = JSON.parse(
    JSON.stringify(classes)
  ) as ExtendedClassesByCourseID;
  for (const courseID of Object.keys(newClasses)) {
    newClasses[courseID] = newClasses[courseID].filter((classToBeChecked) => {
      return (
        classToBeChecked["SLOT"].split("+").find((slot) => {
          if (reservedSlots.includes(slot)) return reservedSlots.includes(slot);
        }) === undefined
      );
    });
  }
  return newClasses;
};

const verifyPreferencesSet = (
  courseIDs: Array<string>,
  classes: ClassesByCourseID
) => {
  if (courseIDs.length === 0) {
    alert(`Please select at least one course.`);
    return { proceed: false, error: "NO_COURSES" };
  }
  const unsetCourses: Array<string> = [];
  courseIDs.forEach((courseID) => {
    if (classes[courseID] === undefined || classes[courseID].length === 0)
      unsetCourses.push(courseID);
  });
  if (unsetCourses.length > 0) {
    alert(
      `Please add at least one class for each course.
        Courses with no classes added yet: ${unsetCourses.join(", ")}`
    );
    return { proceed: false, error: "NO_CLASSES", data: unsetCourses };
  }
  return { proceed: true };
};

const getNumberOfTotalPossibleSelections = (classes: ClassesByCourseID) => {
  let first = true;
  const keysArray = Object.keys(classes);
  if (keysArray.length > 0)
    return parseFloat(
      keysArray.reduce((total, key) => {
        if (first) {
          first = false;
          return (
            classes[Object.keys(classes)[0]].length * classes[key].length
          ).toString();
        }
        return (parseFloat(total) * classes[key].length).toString();
      })
    );
  return 0;
};

const verifyNumberOfClasses = (
  courseIDs: Array<string>,
  classes: ClassesByCourseID
) => {
  let courseIDWithTooFewClasses;

  if (
    courseIDs.find((courseID) => {
      courseIDWithTooFewClasses = courseID;
      return classes[courseID] === undefined || classes[courseID].length === 0;
    })
    // Object.keys(classes).find((courseID) => {
    //   courseIDWithTooFewClasses = courseID;
    //   return classes[courseID].length === 0;
    // })
  ) {
    alert(
      `No valid classes found for ${courseIDWithTooFewClasses}\n` +
        `Please either reduce reserved slots or add more classes with different slots from this course`
    );
    return { proceed: false, error: "NO_VALID_CLASSES" };
  }

  const numberOfPossibilities = getNumberOfTotalPossibleSelections(classes);
  if (numberOfPossibilities > 200_000_000) {
    const minutes = numberOfPossibilities / 50_000_000;
    return {
      proceed: confirm(
        `Number of Possibilities: ${numberOfPossibilities.toLocaleString()}\n` +
          `Time required: (approx) ${minutes.toLocaleString()} minutes (Actual time required might be much less)\n` +
          // `If you get a message saying "Page Unresponsive" after choosing to proceed, please choose to wait.\n` +
          `To reduce possibilities, reduce the number of classes selected or reserve more slots\n` +
          `Proceed?`
      ),
    };
  }
  return { proceed: true };
};

const getWorkerInstance = () => {
  return new ComlinkWorker<typeof import("../workers/workers")>(
    new URL("./workers/workers", import.meta.url)
  );
};

export const populateSlotCombination = async (
  classes: ExtendedClassesByCourseID,
  reservedSlots: Array<string>,
  slotsString: string,
  objectToPopulate: SchedulesBySlotCombination
) => {
  const workerInstance = getWorkerInstance();
  const mapping = getSlotMapping();

  const courseIDs = Object.keys(classes);
  classes = removeReservedSlots(classes, reservedSlots);

  // sorting courseIDs in ascending order of the number of classes
  // with that courseID.
  // This is done so that backtracking algorithm will terminate quicker
  // in case some mistake is found.
  courseIDs.sort((courseIDa, courseIDb) => {
    return classes[courseIDa].length - classes[courseIDb].length;
  });

  console.time("populateSlotCombination");
  const populatedSlotCombination = await workerInstance.populateSlotCombination(
    courseIDs,
    classes,
    slotsString,
    mapping,
    objectToPopulate
  );
  console.timeEnd("populateSlotCombination");
  return populatedSlotCombination;
};

export const getSlotCombinations = async (
  classes: ExtendedClassesByCourseID,
  reservedSlots: Array<string>
) => {
  const workerInstance = getWorkerInstance();
  const mapping = getSlotMapping();
  const courseIDs = Object.keys(classes);

  const {
    proceed: proceed1,
    error: error1,
    data,
  } = verifyPreferencesSet(courseIDs, classes);
  if (!proceed1) {
    if (error1) return { error: error1, data };
    return { error: "PREFERENCES_ERROR", data };
  }

  classes = removeReservedSlots(classes, reservedSlots);
  const { proceed: proceed2, error: error2 } = verifyNumberOfClasses(
    courseIDs,
    classes
  );
  if (!proceed2) {
    if (error2) return { error: error2, data };
    return { error: "NO_CLASSES_ERROR", data };
  }

  // sorting courseIDs in ascending order of the number of classes
  // with that courseID.
  // This is done so that backtracking algorithm will terminate quicker
  // in case some mistake is found.
  courseIDs.sort((courseIDa, courseIDb) => {
    return classes[courseIDa].length - classes[courseIDb].length;
  });

  console.log(
    "All Possible Selections:",
    getNumberOfTotalPossibleSelections(classes)
  );

  console.time("getSlotCombinations");
  const possibleSlotCombinations = await workerInstance.getSlotCombinations(
    courseIDs,
    classes,
    mapping
  );
  const possibleSlotCombinationsObject: {
    [slotCombination: string]: Array<Schedule>;
  } = {};
  possibleSlotCombinations.forEach(
    (slotCombination) =>
      (possibleSlotCombinationsObject[slotCombination.join("+")] = [])
  );
  console.timeEnd("getSlotCombinations");
  return possibleSlotCombinationsObject;
};

export const getTimetables = async (
  classes: ExtendedClassesByCourseID,
  reservedSlots: Array<string>
) => {
  const workerInstance = getWorkerInstance();

  const mapping = getSlotMapping();

  const courseIDs = Object.keys(classes);
  // let classes = await getClasses(faculties);

  const { proceed } = verifyPreferencesSet(courseIDs, classes);
  if (!proceed) return [];
  // if (!verifyPreferencesSet(courseIDs, classes)) return [];

  classes = removeReservedSlots(classes, reservedSlots);
  const { proceed: proceed2 } = verifyNumberOfClasses(courseIDs, classes);
  if (!proceed2) return [];
  // if (!verifyNumberOfClasses(courseIDs, classes)) return [];

  // sorting courseIDs in ascending order of the number of classes
  // with that courseID.
  // This is done so that backtracking algorithm will terminate quicker
  // in case some mistake is found.
  courseIDs.sort((courseIDa, courseIDb) => {
    return classes[courseIDa].length - classes[courseIDb].length;
  });

  console.time("getSlotCombinations");
  const possibleSlotCombinations = await workerInstance.getSlotCombinations(
    courseIDs,
    classes,
    mapping
  );
  console.timeEnd("getSlotCombinations");
  console.time("selectClasses");
  const possibleClassSelections = await workerInstance.selectClasses(
    courseIDs,
    classes,
    mapping
  );
  console.timeEnd("selectClasses");

  // console.log("Possible slot combinations", possibleSlotCombinations);
  // if (Object.keys(possibleClassSelections).length > 0);
  // Remove the semicolon at the end of the if statement when you uncomment this
  // console.log(
  //   "all possible class selections",
  //   possibleClassSelections,
  //   "Groups:",
  //   Object.keys(possibleClassSelections).length,
  //   "Possible Schedules:",
  //   Object.keys(possibleClassSelections).reduce((total, key) => {
  //     if (first) {
  //       first = false;
  //       return (
  //         possibleClassSelections[Object.keys(possibleClassSelections)[0]]
  //           .length + possibleClassSelections[key].length
  //       );
  //     }
  //     return total + possibleClassSelections[key].length;
  //   })
  // );
  if (Object.keys(possibleClassSelections).length === 0)
    alert("No valid schedules found.");

  const actualSlotCombinations = Object.keys(possibleClassSelections);
  const possibleSlotCombinationStrings = possibleSlotCombinations.map(
    (slotCombination) => slotCombination.join("+")
  );

  const possibleSlotCombinationsObject: {
    [slotCombination: string]: Array<Class>;
  } = {};
  possibleSlotCombinationStrings.forEach(
    (slotCombination) => (possibleSlotCombinationsObject[slotCombination] = [])
  );

  const missedSlotCombinations: Array<string> = [];
  const impossibleSlotCombinations: Array<string> = [];

  actualSlotCombinations.forEach((slotCombination) => {
    if (!possibleSlotCombinationStrings.includes(slotCombination))
      missedSlotCombinations.push(slotCombination);
  });
  possibleSlotCombinationStrings.forEach((slotCombination) => {
    if (!actualSlotCombinations.includes(slotCombination))
      impossibleSlotCombinations.push(slotCombination);
  });
  console.log(
    "Possible Slot combinations",
    possibleSlotCombinationsObject,
    "Missed Slot Combinations",
    missedSlotCombinations,
    "Impossible Slot Combinations",
    impossibleSlotCombinations
  );

  console.time("populatedSlotCombination");
  const populatedSlotCombinationsObject =
    await workerInstance.populateSlotCombination(
      courseIDs,
      classes,
      possibleSlotCombinationStrings[0],
      mapping
    );
  console.log(
    "Actual Schedules",
    possibleClassSelections[possibleSlotCombinationStrings[0]],
    "Possible Schedules",
    populatedSlotCombinationsObject[possibleSlotCombinationStrings[0]]
  );
  console.timeEnd("populatedSlotCombination");

  return possibleClassSelections;
};
