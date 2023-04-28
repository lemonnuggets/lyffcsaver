import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { addClassToCourse, addClassesToCourse } from "@/app/reducers/classes";
import classesData from "@/data/classes.json";
import { Class, ExtendedClass } from "@/types";
import { getCourseID } from "@/utils/generalUtils";
import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import styles from "./ClassSelect.module.css";
import {
  getAvailableClasses,
  isTheoryComponent,
  toExtendedClasses,
} from "./utils";

const defaultQuery = {
  searchQuery: "",
  slots: "",
};

const ClassSelect = () => {
  const { selectedCourseID, selectedClasses } = useAppSelector(
    (state) => state.class
  );
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState(defaultQuery);
  const [classesToDisplay, setClassesToDisplay] = useState<
    Array<ExtendedClass>
  >([]);

  const completeFilteredClasses = useMemo(() => {
    return selectedCourseID !== null
      ? getAvailableClasses(selectedCourseID)
      : [];
  }, [selectedCourseID]);

  const availableSlots = useMemo(() => {
    return new Set(
      completeFilteredClasses.map((classData) => classData["SLOT"])
    );
  }, [completeFilteredClasses]);

  const fuse = useMemo(() => {
    return new Fuse(completeFilteredClasses, {
      keys: ["ERP ID", "EMPLOYEE NAME"],
      shouldSort: true,
      threshold: 0.2,
    });
  }, [completeFilteredClasses]);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [selectedCourseID]);

  useEffect(() => {
    const results =
      query.searchQuery.length > 1
        ? fuse.search(query.searchQuery).map((result) => result.item)
        : completeFilteredClasses;
    setClassesToDisplay(
      results.filter(
        (completeFilteredClass) =>
          query.slots.length <= 1 ||
          completeFilteredClass["SLOT"] === query.slots
      )
    );
  }, [query, completeFilteredClasses, fuse]);

  const getLabComponent = (classData: Class) => {
    if (!isTheoryComponent(classData)) return;
    // console.log(selectedClasses);
    return Object.keys(selectedClasses).find((courseID) => {
      return (
        courseID.startsWith(classData["COURSE CODE"]) &&
        courseID.endsWith("ELA")
      );
    });
  };

  const selectAllWith = (
    fieldName: keyof Class,
    value: string,
    courseID: string
  ) => {
    const validClasses = classesData.filter(
      (classData) =>
        getCourseID(classData) === courseID && classData[fieldName] === value
    );
    dispatch(
      addClassesToCourse({
        classes: toExtendedClasses(validClasses),
        courseID: courseID,
      })
    );
  };

  return (
    <div className={styles.container} id="class-selection-section">
      <div className={styles.queryRow} id="class-selection-query-row">
        <div className={styles.search}>
          <label
            htmlFor="faculty-search"
            className={`${styles.title} body1-bold`}
          >
            Search by Faculty
          </label>
          <input
            type="text"
            id="faculty-search"
            name="faculty-search"
            value={query.searchQuery}
            onInput={(e) => {
              setQuery((prevQuery) => {
                const targetElement = e.target as HTMLInputElement;
                const obj = {
                  slots: prevQuery.slots,
                  searchQuery: targetElement.value,
                };
                return obj;
              });
            }}
            placeholder="Eg. 14494 or AKHILA MAHESWARI M"
          />
        </div>
        <div className={styles.slots}>
          <label
            htmlFor="faculty-slots-filter"
            className={`${styles.title} body1-bold`}
          >
            Filter classes by slots
          </label>
          <select
            name="faculty-slots-filter"
            id="faculty-slots-filter"
            value={query.slots.length > 1 ? query.slots : ""}
            onChange={(e) =>
              setQuery((prevQuery) => {
                return {
                  slots: e.target.value,
                  searchQuery: prevQuery.searchQuery,
                };
              })
            }
          >
            <option value="">Any Slot</option>
            {Array.from(availableSlots)
              .sort((a, b) => {
                let result = 0;
                if (a.length > b.length) result += 5;
                else if (a.length < b.length) result -= 5;

                if (a > b) result += 1;
                else if (a < b) result -= 1;
                return result;
              })
              .map((slot) => {
                return (
                  <option value={slot} key={`faculty-filter-${slot}`}>
                    {slot}
                  </option>
                );
              })}
          </select>
        </div>
      </div>
      <div className={styles.resultsWrapper}>
        <div className={styles.results}>
          {classesToDisplay
            .filter(
              (classData) =>
                selectedCourseID !== null &&
                selectedClasses[selectedCourseID]?.find(
                  (_classData) =>
                    classData["CLASS ID"] === _classData["CLASS ID"]
                ) === undefined
            )
            .sort((a, b) => {
              let result = 0;
              if (a["EMPLOYEE NAME"] > b["EMPLOYEE NAME"]) result += 10;
              else if (a["EMPLOYEE NAME"] < b["EMPLOYEE NAME"]) result -= 10;

              if (a["SLOT"].length > b["SLOT"].length) result += 5;
              else if (a["SLOT"].length < b["SLOT"].length) result -= 5;

              if (a["SLOT"] > b["SLOT"]) result += 1;
              else if (a["SLOT"] < b["SLOT"]) result -= 1;
              return result;
            })
            .map((classData) => {
              return (
                <div
                  className={`${styles.class} selectable-class`}
                  key={`class-select-${getCourseID(classData)}-${
                    classData["ERP ID"]
                  }-${classData["SLOT"]}-${classData["CLASS ID"]}`}
                >
                  <div className={`${styles.facultyName} body1-bold`}>
                    {classData["EMPLOYEE NAME"]}
                  </div>
                  <a
                    className={styles.add}
                    onClick={(e) => {
                      e.stopPropagation();
                      // addClass(classData);
                      if (selectedCourseID === null) return;
                      dispatch(
                        addClassToCourse({
                          class: classData,
                          courseID: selectedCourseID,
                        })
                      );
                      const labComponent = getLabComponent(classData);
                      if (labComponent === undefined) return;
                      selectAllWith(
                        "ERP ID",
                        classData["ERP ID"],
                        labComponent
                      );
                    }}
                  >
                    +
                  </a>
                  <div className={styles.erpId}>{classData["ERP ID"]}</div>
                  <div className={styles.classSlots}>
                    {classData["SLOT"]?.split("+").map((slot, index) => (
                      <span
                        className={styles.classSlot}
                        key={`${slot}-class-slot`}
                      >
                        {index !== 0 ? "+" : ""}
                        {slot}
                        <wbr />
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
export default ClassSelect;
