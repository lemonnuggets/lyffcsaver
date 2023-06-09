import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectCourse,
  stageCourse,
  unstageCourse,
} from "@/app/reducers/classes";
import Button from "../../atoms/Button";
import coursesData from "../../data/courses.json";
import Searchbar from "../../molecules/Searchbar";
import { Course } from "../../types";
import { getCourseID, isProject } from "../../utils/generalUtils";
import styles from "./CourseSelect.module.css";

const CourseSelect = () => {
  const { selectedClasses, selectedCourseID, stagedCourses } = useAppSelector(
    (state) => state.class
  );
  const dispatch = useAppDispatch();

  const hasSelectedClasses = (courseID: string) => {
    return selectedClasses[courseID]?.length > 0;
  };
  let filteredCourses = coursesData.filter(
    (course: Course) =>
      stagedCourses.find(
        (stagedCourse) => getCourseID(stagedCourse) === getCourseID(course)
      ) === undefined
  );
  const seenCourses = new Set();
  filteredCourses = filteredCourses.filter((course) => {
    const duplicate = seenCourses.has(course["COURSE CODE"]);
    seenCourses.add(course["COURSE CODE"]);
    return !duplicate;
  });
  const totalCredits =
    stagedCourses.reduce((total, current) => {
      return total + Number(current["CREDITS"]);
    }, 0) || 0;
  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <div className={`${styles.title} body1-bold`}>Select Course</div>
        <Searchbar
          selector="course-select-autocomplete"
          data={filteredCourses}
          keys={["COURSE CODE", "COURSE TITLE"]}
          onSelect={(selectedString) => {
            console.log("selected string", selectedString);
            coursesData.forEach((course) => {
              if (selectedString.startsWith(course["COURSE CODE"]))
                dispatch(stageCourse(course)); // TODO: only select automatically if not ELA
            });
          }}
          getUnique={(course) =>
            `${course["COURSE CODE"]} - ${course["COURSE TITLE"]}`
          }
          placeholder="Eg: CSE1002 or Problem Solving and Programming"
          threshold={0.4}
          suggestionElement={(course, classNames, value, onSelect, key) => {
            console.log(value);
            return (
              <div
                className={`${styles.courseSuggestion} ${classNames}`}
                data-value={value}
                onClick={(e) => {
                  console.log("CLICkED");
                  console.log(e.target);
                  let currentElement = e.target as HTMLDivElement;
                  while (
                    !currentElement.classList.contains(
                      styles.courseSuggestion
                    ) &&
                    currentElement !== null
                  ) {
                    currentElement =
                      currentElement.parentElement as HTMLDivElement;
                  }
                  const selectedString = currentElement.dataset.value;
                  if (selectedString) onSelect(selectedString);
                }}
                key={key}
              >
                <div>{course["COURSE CODE"]}</div>
                <div>{course["COURSE TITLE"]}</div>
              </div>
            );
          }}
          maxResults={4}
        ></Searchbar>
      </div>
      <div className={styles.stagedCourses}>
        <div className={`${styles.title} body1-bold`}>Selected Courses</div>
        <div className={styles.addedCourses}>
          <div className={styles.resultsWrapper} id="added-courses">
            <div className={styles.results}>
              {stagedCourses.map((stagedCourse) => {
                return (
                  <div
                    className={`${styles.course} ${
                      getCourseID(stagedCourse) === selectedCourseID
                        ? styles.selectedCourse
                        : ""
                    } ${
                      isProject(getCourseID(stagedCourse))
                        ? styles.disabledCourse
                        : ""
                    } ${
                      hasSelectedClasses(getCourseID(stagedCourse))
                        ? styles.filled
                        : styles.empty
                    } staged-course`}
                    key={`selected-course-${getCourseID(stagedCourse)}`}
                    onClick={(e) => {
                      dispatch(selectCourse(stagedCourse));
                    }}
                  >
                    <div className={`${styles.courseTitle} body1-bold`}>
                      {stagedCourse["COURSE TITLE"]}
                    </div>
                    <a
                      className={styles.delete}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(unstageCourse(stagedCourse));
                      }}
                    >
                      X
                    </a>
                    <div className={styles.courseCode}>
                      {stagedCourse["COURSE CODE"]}
                    </div>
                    <div className={styles.courseType}>
                      {stagedCourse["COURSE TYPE"]}
                    </div>
                    <div className={styles.courseCredits}>
                      CREDITS: {stagedCourse["CREDITS"]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.footer} id="staged-courses-footer">
            <div className={styles.totalCredits}>
              TOTAL CREDITS: {totalCredits}
            </div>
            <div className={styles.buttons}>
              <Button
                clickedCallback={() =>
                  stagedCourses.forEach((course) => {
                    dispatch(unstageCourse(course));
                  })
                }
                type="clear"
                disabled={stagedCourses?.length === 0}
              >
                CLEAR
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSelect;
