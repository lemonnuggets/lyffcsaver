import leftArrow from "@/assets/leftArrow.svg";
import rightArrow from "@/assets/rightArrow.svg";
import {
  Class,
  ExtendedClass,
  ExtendedClassesByCourseID,
  Schedule,
} from "@/types";
import { isUnique } from "@/utils/generalUtils";
import React, { MouseEvent, useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import ClassTable from "../ClassTable";
import styles from "./Classes.module.css";

type Props = {
  schedules: Array<Schedule>;
  slots: Array<string>;
  currentSchedule: Schedule;
  setCurrentSchedule: React.Dispatch<React.SetStateAction<Schedule>>;
  setHoveredSlots: React.Dispatch<React.SetStateAction<Array<string>>>;
  getScore: (courseID: string, classData: Class) => number;
};

const Classes = ({
  schedules,
  slots,
  currentSchedule,
  setCurrentSchedule,
  setHoveredSlots,
  getScore,
}: Props) => {
  const courseIDs = schedules?.length > 0 ? Object.keys(schedules[0]) : [];
  const previewsPerPage = 1;
  const pageCount = courseIDs?.length / previewsPerPage;
  const [currentPage, setCurrentPage] = useState(1);

  const getScheduleScore = (schedule: Schedule) => {
    let score = 0;
    Object.keys(schedule).forEach(
      (courseID) => (score += getScore(courseID, schedule[courseID]))
    );
    return score;
  };
  schedules?.sort((a, b) => getScheduleScore(b) - getScheduleScore(a));

  useEffect(() => {
    setCurrentPage(0);
  }, [slots, schedules]);

  useEffect(() => {
    const newSelectedClasses: Schedule = {};
    if (schedules !== undefined && schedules.length > 0)
      for (const courseID of Object.keys(schedules[0])) {
        newSelectedClasses[courseID] = schedules[0][courseID];
      }
    setCurrentSchedule(newSelectedClasses);
  }, [slots, schedules]);

  const handleHover = (hoveredClass: Class, element: MouseEvent) => {
    if (hoveredClass === undefined) return;
    setHoveredSlots(hoveredClass["SLOT"].split("+"));
    document
      .querySelectorAll(`.${styles.hoverRow}`)
      .forEach((e) => e.classList.remove(styles.hoverRow));
    let currentElement = element?.target as HTMLElement | null;
    while (
      currentElement !== null &&
      currentElement !== undefined &&
      !currentElement?.classList?.contains(styles.tableRow)
    ) {
      currentElement = currentElement.parentElement;
    }
    currentElement?.classList?.add(styles.hoverRow);
  };

  const handleDehover = (hoveredClass: Class, element: MouseEvent) => {
    setHoveredSlots([]);
    document
      .querySelectorAll(`.${styles.hoverRow}`)
      .forEach((e) => e.classList.remove(styles.hoverRow));
  };
  const classes: ExtendedClassesByCourseID = {};
  schedules?.forEach((schedule) =>
    courseIDs?.forEach((courseID) => {
      if (classes[courseID] === undefined) classes[courseID] = [];
      if (isUnique("CLASS ID", classes[courseID], schedule[courseID]))
        classes[courseID].push(schedule[courseID]);
    })
  );
  courseIDs.sort((a, b) => classes[b].length - classes[a].length);
  const currentPageData = courseIDs
    ?.slice(currentPage * previewsPerPage, (currentPage + 1) * previewsPerPage)
    ?.map((courseID) => {
      return (
        <ClassTable
          onInteraction={(
            e,
            currentCourseID,
            currentClass,
            isSelectedClass
          ) => {
            setCurrentSchedule((prevSelectedClasses) => {
              const newSelectedClasses = { ...prevSelectedClasses };
              if (newSelectedClasses[currentCourseID] === undefined)
                newSelectedClasses[currentCourseID] = {} as ExtendedClass;
              const target = e.target as HTMLInputElement;
              if (target.checked) {
                for (const courseIDToBeChecked of Object.keys(
                  newSelectedClasses
                )) {
                  if (
                    currentCourseID !== courseIDToBeChecked &&
                    newSelectedClasses[courseIDToBeChecked]["SLOT"]
                      ?.split("+")
                      ?.find((slot) =>
                        currentClass["SLOT"].split("+").includes(slot)
                      )
                  ) {
                    delete newSelectedClasses[courseIDToBeChecked];
                  }
                }
                // if(isLabComponent(currentClass))
                if (!isSelectedClass(currentClass, currentCourseID))
                  newSelectedClasses[currentCourseID] = currentClass;
              } else {
                delete newSelectedClasses[currentCourseID];
              }
              return newSelectedClasses;
            });
          }}
          key={`${slots.join("")}-${courseID}`}
          handleHover={handleHover}
          handleDehover={handleDehover}
          courseIDs={courseIDs}
          schedules={schedules}
          courseID={courseID}
          selectedClasses={currentSchedule}
          slots={slots}
          getScore={getScore}
        ></ClassTable>
      );
    });
  const leftArrowNode = <img src={leftArrow} alt="<" />;
  const rightArrowNode = <img src={rightArrow} alt=">" />;
  return schedules === undefined || schedules.length <= 0 ? (
    <></>
  ) : (
    <div className={styles.panel} id="classes">
      <ReactPaginate
        previousLabel={leftArrowNode}
        nextLabel={rightArrowNode}
        pageCount={pageCount}
        onPageChange={({ selected }) => {
          setCurrentPage(selected);
        }}
        pageLabelBuilder={(page) => {
          return courseIDs[page - 1];
        }}
        containerClassName={styles.schedulesPagination}
        pageClassName={styles.page}
        previousLinkClassName={styles.previous}
        nextLinkClassName={styles.next}
        disabledClassName={styles.disabled}
        activeClassName={styles.active}
        marginPagesDisplayed={1}
        forcePage={currentPage}
      ></ReactPaginate>
      <div className={styles.container}>{currentPageData}</div>
    </div>
  );
};

export default Classes;
