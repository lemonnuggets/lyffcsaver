import { Schedule } from "@/types";
import timetableTemplateData from "@/utils/timetableTemplateData";
import styles from "./Timetable.module.css";
import {
  getCellContent,
  getClassBySlotInSchedule,
  getClassName,
  getCoursesWithDifferentFaculties,
  getSlotTiming,
} from "./utils";
type Props = {
  slots: Array<string>;
  hoveredSlots: Array<string>;
  hasValidSelections: () => boolean;
  schedule: Schedule;
};

const Timetable = ({
  slots,
  schedule,
  hoveredSlots,
  hasValidSelections,
}: Props) => {
  let dayCount = 0;
  const id = "final-display";
  return (
    <div className={styles.container}>
      <table className={styles.timetable} id="filled-out-timetable">
        <thead>
          {timetableTemplateData.slice(0, 4).map((row, rowIndex) => {
            return (
              <tr key={`${id}-row-${rowIndex}`}>
                {row.map((cell, index) => {
                  return cell === "" || index === 1 ? null : (
                    <th
                      key={`${id}-${rowIndex}-${index}`}
                      className={getClassName(
                        cell,
                        rowIndex,
                        index,
                        slots,
                        hoveredSlots,
                        styles,
                        dayCount
                      )}
                      rowSpan={index === 0 ? 2 : 1}
                    >
                      {cell !== "Lunch" ? cell : ""}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody>
          {timetableTemplateData.slice(4).map((row, rowIndex) => {
            if (rowIndex % 2 === 0) dayCount++;
            return (
              <tr key={`${id}-row-${rowIndex}`}>
                {row.map((cell, cellIndex) => {
                  const classInSlot = getClassBySlotInSchedule(schedule, cell);
                  const courseTitle =
                    classInSlot && classInSlot["COURSE TITLE"];
                  const employeeName =
                    classInSlot && classInSlot["EMPLOYEE NAME"];
                  return cell === "" ||
                    cellIndex === 1 ||
                    (rowIndex > 0 && cell === "Lunch") ? null : (
                    <td
                      key={`${id}-${rowIndex}-${cellIndex}`}
                      className={`${getClassName(
                        cell,
                        rowIndex + 4,
                        cellIndex,
                        slots,
                        hoveredSlots,
                        styles,
                        dayCount
                      )}`}
                      rowSpan={cell === "Lunch" ? 14 : cellIndex === 0 ? 2 : 1}
                    >
                      {getCellContent(schedule, cell, slots)}
                      {slots.includes(cell) ? (
                        <div className={`${styles.tooltip} caption`}>
                          <span></span>
                          <div className={styles.tooltipContainer}>
                            <div className={styles.tooltipRow}>
                              COURSE TITLE:- {courseTitle}
                            </div>
                            <div className={styles.tooltipRow}>
                              SLOT:- {cell}
                            </div>
                            <div className={styles.tooltipRow}>
                              TIMING:-{" "}
                              {getSlotTiming(cell, cellIndex).join(" - ")}
                            </div>
                            <div className={styles.tooltipRow}>
                              FACULTY NAME:- {employeeName}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {getCoursesWithDifferentFaculties(schedule).length === 0 ? (
        <></>
      ) : (
        <div className={styles.disclaimer}>
          DISCLAIMER: The currently selected timetable has different faculties
          in the components of the following courses:-{" "}
          {getCoursesWithDifferentFaculties(schedule).join(", ")}
          <br />
          {hasValidSelections() ? (
            <>
              Consider selecting the same faculties for all components of the
              course.
            </>
          ) : (
            <>No common faculties found</>
          )}
        </div>
      )}
    </div>
  );
};

export default Timetable;
