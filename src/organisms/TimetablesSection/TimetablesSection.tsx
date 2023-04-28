import { useAppSelector } from "@/app/hooks";
import TimetablePreviews from "@/organisms/TimetablePreviews";
import Timetables from "@/organisms/Timetables";
import styles from "./TimetablesSection.module.css";

const TimetablesSection = () => {
  const { schedules } = useAppSelector((state) => state.schedules);
  const slotCombinations = Object.keys(schedules);

  return (
    <div
      className={`${styles.screen} ${
        slotCombinations.length > 0 ? "" : styles.disableScreen
      }`}
    >
      <span className={styles.goto} id="timetable-previews">
        &nbsp;
      </span>
      <TimetablePreviews></TimetablePreviews>
      <span className={styles.goto} id="timetable">
        &nbsp;
      </span>
      <Timetables></Timetables>
    </div>
  );
};

export default TimetablesSection;
