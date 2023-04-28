import InfoCols from "@/atoms/InfoCols";
import {
  Class,
  ExtendedClass,
  ExtendedClassesByCourseID,
  Schedule,
} from "@/types";
import { getCourseID, isUnique } from "@/utils/generalUtils";
import { MouseEvent } from "react";
import styles from "./Classes.module.css";
type Props = {
  courseIDs: Array<string>;
  courseID: string;
  schedules: Array<Schedule>;
  selectedClasses: Schedule;
  slots: Array<string>;
  getScore: (courseID: string, classData: Class) => number;
  handleHover?: (hoveredClass: Class, element: MouseEvent) => void;
  handleDehover?: (hoveredClass: Class, element: MouseEvent) => void;
  onInteraction?: (
    e: MouseEvent,
    currentCourseID: string,
    currentClass: ExtendedClass,
    isSelectedClass: (
      classToBeChecked: ExtendedClass,
      currentCourseID: string
    ) => boolean
  ) => any;
};
const ClassTable = ({
  courseIDs,
  schedules,
  courseID,
  selectedClasses,
  slots,
  getScore,
  handleHover,
  handleDehover,
  onInteraction,
}: Props) => {
  const classes: ExtendedClassesByCourseID = {};
  const ignoreCols = [
    "REGISTERED SEATS",
    "ASSO CLASS ID",
    "COURSE ID",
    "CLASS OPTION",
    // "COURSE TYPE",
    "WAITING SEATS",
    "COURSE STATUS",
    "COURSE MODE",
    "COURSE CODE",
    "BATCH",
    "ALLOCATED SEATS",
  ];
  const isSelectedClass = (
    classToBeChecked: ExtendedClass,
    currentCourseID: string
  ) => {
    return (
      selectedClasses !== undefined &&
      selectedClasses[currentCourseID] !== undefined &&
      selectedClasses[currentCourseID]["CLASS ID"] ===
        classToBeChecked["CLASS ID"]
    );
  };
  schedules?.forEach((schedule) =>
    courseIDs?.forEach((courseID) => {
      if (classes[courseID] === undefined) classes[courseID] = [];
      if (isUnique("CLASS ID", classes[courseID], schedule[courseID]))
        classes[courseID].push(schedule[courseID]);
    })
  );
  courseIDs.forEach((courseID) =>
    classes[courseID]?.sort(
      (a, b) => getScore(courseID, b) - getScore(courseID, a)
    )
  );

  const getClassName = (classToBeChecked: Class) => {
    // console.log(classToBeChecked);
    let className = `${styles.tableRow} `;
    const newSlots = classToBeChecked["SLOT"].split("+");
    const noSlotConflict =
      selectedClasses !== undefined &&
      selectedClasses !== null &&
      newSlots.find(
        (slot) =>
          Object.keys(selectedClasses).find(
            (courseID) =>
              getCourseID(classToBeChecked) !== courseID &&
              selectedClasses[courseID]["SLOT"].split("+").includes(slot)
          ) !== undefined
      ) === undefined;
    if (!noSlotConflict) className += `${styles.faded} `;
    return className;
  };

  type InteractionElementProps = {
    currentClass: ExtendedClass;
    customKey: string;
    currentCourseID: string;
  };
  const InteractionElement = ({
    currentClass,
    customKey,
    currentCourseID,
  }: InteractionElementProps) => {
    return (
      <td className={styles.cell}>
        <input
          type="radio"
          name="selected"
          id={`${customKey}-selected`}
          key={customKey}
          onClick={(e) => {
            if (onInteraction)
              onInteraction(e, currentCourseID, currentClass, isSelectedClass);
            // setSelectedClasses({ ...newSelectedClasses });
          }}
          defaultChecked={isSelectedClass(currentClass, currentCourseID)}
          className={styles.checkbox}
        />
      </td>
    );
  };
  const columnKeys: Array<string> = [];
  const colsHeadings = () => {
    columnKeys.length = 0;
    return courseIDs?.length > 0 && schedules[0][courseIDs[0]] !== undefined
      ? Object.keys(schedules[0][courseIDs[0]]).map((colName, index) => {
          if (ignoreCols && !ignoreCols.includes(colName)) {
            columnKeys.push(colName);
            return (
              <th
                className={`${styles.cell} ${styles.headRow}`}
                key={`${slots.join("")}-${index}-head-${colName}`}
              >
                {colName}
              </th>
            );
          }
        })
      : [];
  };
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th
              className={`${styles.cell} ${styles.headRow}`}
              colSpan={colsHeadings().length}
            >
              {courseID}
            </th>
          </tr>

          <tr>
            <th className={`${styles.cell} ${styles.headRow}`}></th>

            {colsHeadings()}
          </tr>
        </thead>
        <tbody>
          {selectedClasses === undefined ||
          selectedClasses[courseID] === undefined ? (
            <></>
          ) : (
            <tr
              key={`${slots.join("")}-${courseID}-${
                selectedClasses[courseID]["CLASS ID"]
              }`}
              className={styles.tableRow}
              onMouseEnter={(e) =>
                handleHover ? handleHover(selectedClasses[courseID], e) : null
              }
              onMouseLeave={(e) =>
                handleDehover
                  ? handleDehover(selectedClasses[courseID], e)
                  : null
              }
              id={`${selectedClasses[courseID]["CLASS ID"]}`}
            >
              <InteractionElement
                currentClass={selectedClasses[courseID]}
                customKey={`${slots.join("")}-${courseID}-${
                  selectedClasses[courseID]["CLASS ID"]
                }`}
                currentCourseID={courseID}
              ></InteractionElement>

              <InfoCols
                keys={columnKeys}
                entry={selectedClasses[courseID]}
                styles={styles}
                ignoreCols={ignoreCols}
                getID={() =>
                  `${slots.join("")}-${courseID}-${
                    selectedClasses[courseID]["CLASS ID"]
                  }`
                }
              ></InfoCols>
            </tr>
          )}
          {classes[courseID]?.map((currentClass) => {
            if (!isSelectedClass(currentClass, courseID))
              return (
                <tr
                  key={`${slots.join("")}-${courseID}-${
                    currentClass["CLASS ID"]
                  }`}
                  onMouseEnter={(e) =>
                    handleHover
                      ? handleHover(selectedClasses[courseID], e)
                      : null
                  }
                  onMouseLeave={(e) =>
                    handleDehover
                      ? handleDehover(selectedClasses[courseID], e)
                      : null
                  }
                  className={getClassName(currentClass)}
                  id={`${currentClass["CLASS ID"]}`}
                >
                  <InteractionElement
                    currentClass={currentClass}
                    customKey={`${slots.join("")}-${courseID}-${
                      currentClass["CLASS ID"]
                    }`}
                    currentCourseID={courseID}
                  ></InteractionElement>

                  <InfoCols
                    keys={columnKeys}
                    entry={currentClass}
                    styles={styles}
                    ignoreCols={ignoreCols}
                    getID={() =>
                      `${slots.join("")}-${courseID}-${
                        currentClass["CLASS ID"]
                      }`
                    }
                  ></InfoCols>
                </tr>
              );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ClassTable;
