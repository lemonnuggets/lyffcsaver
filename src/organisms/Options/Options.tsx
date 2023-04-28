import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectCourseByID } from "@/app/reducers/classes";
import { clearReserved } from "@/app/reducers/reserveSlots";
import {
  clearSchedules,
  deselectSlotCombination,
  setSchedules,
} from "@/app/reducers/schedules";
import Button from "@/atoms/Button";
import ClassSelect from "@/organisms/ClassSelect";
import CourseSelect from "@/organisms/CourseSelect";
import ReserveSlots from "@/organisms/ReserveSlots";
import { SchedulesBySlotCombination } from "@/types";
import { getSlotCombinations } from "@/utils/workerUtils";
import { useState } from "react";
import ClassPreference from "../ClassPreference";
import styles from "./Options.module.css";

const Options = () => {
  const reservedSlots = useAppSelector((state) => state.reserve.reservedSlots);
  const { selectedClasses } = useAppSelector((state) => state.class);
  const dispatch = useAppDispatch();

  const [reserveView, setReserveView] = useState(1);

  const getAllSlotCombinations = async () => {
    dispatch(clearSchedules());
    const result = await getSlotCombinations(selectedClasses, reservedSlots);
    if (result.error !== undefined) return result;
    dispatch(setSchedules(result as SchedulesBySlotCombination));
  };

  return (
    <>
      <div
        className={`${styles.sectionTitle} heading2`}
        id="reserve-slots-section"
      >
        <div className={styles.left_btns}>
          <a
            className={`${styles.btn} body1-medium`}
            onClick={() => {
              setReserveView((prevReserveView) => (prevReserveView + 1) % 2);
            }}
          >
            Change View
          </a>
        </div>
        <div className={styles.title}>Reserve your Slots</div>
        <div className={styles.btns}>
          <a
            className={`${styles.btn} body1-medium`}
            onClick={() => {
              dispatch(clearReserved());
            }}
          >
            Clear
          </a>
          <a
            className={`${styles.btn} body1-medium`}
            // href="#add-courses-section"
            onClick={() => {
              document.getElementById("add-courses-section")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            Skip
          </a>
        </div>
      </div>

      <ReserveSlots view={reserveView} />
      <div
        className={`${styles.sectionTitle} heading2`}
        id="add-courses-section"
      >
        <div className={styles.title}>Add courses</div>
      </div>

      <div className={styles.coursePreferences}>
        <CourseSelect />
        <ClassPreference />
      </div>
      <ClassSelect />
      <Button
        classes={styles.generateTimetablesButton}
        type="primary"
        id="generate-timetables"
        clickedCallback={async () => {
          const result = await getAllSlotCombinations();
          dispatch(deselectSlotCombination());
          // console.log(error);

          // if(error !== undefined)
          let error, data;
          if (result?.error !== undefined) {
            error = result.error;
            data = result.data;
          }
          if (error === "NO_CLASSES") {
            document
              .querySelector("#add-courses-section")
              ?.scrollIntoView({ behavior: "smooth" });
            if (data !== undefined && typeof data[0] === "string")
              dispatch(selectCourseByID(data[0])); // select the first course that has no classes selected
          } else if (error === "NO_COURSES")
            document
              .querySelector("#add-courses-section")
              ?.scrollIntoView({ behavior: "smooth" });
          else if (error === undefined)
            document
              .querySelector("#timetable-previews")
              ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Generate Timetables
      </Button>
    </>
  );
};

export default Options;
