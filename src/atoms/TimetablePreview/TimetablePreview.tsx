import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectSlots } from "@/utils/generalUtils";
import timetableTemplateData from "@/utils/timetableTemplateData";
import styles from "./Timetable.module.css";
import { getClassName } from "./utils";

type Props = {
  slots: Array<string>;
  id: string;
};

const TimetablePreview = ({ slots, id }: Props) => {
  const { selectedClasses } = useAppSelector((state) => state.class);
  const { schedules } = useAppSelector((state) => state.schedules);
  const { reservedSlots } = useAppSelector((state) => state.reserve);
  const dispatch = useAppDispatch();
  let dayCount = 0;
  return (
    <>
      <table
        className={`${styles.timetablePreview} timetable-preview`}
        onClick={async (e) => {
          // console.log("event", e, JSON.stringify(slots));
          await selectSlots(
            selectedClasses,
            reservedSlots,
            slots,
            schedules,
            dispatch
          );

          document
            .querySelectorAll(`.${styles.selectedTimetablePreview}`)
            ?.forEach((element) =>
              element.classList.remove(styles.selectedTimetablePreview)
            );

          let element = e.target as HTMLElement | null;
          while (element !== null && element !== undefined) {
            if (element.classList.contains(styles.timetablePreview)) {
              element.classList.add(styles.selectedTimetablePreview);
              break;
            }
            element = element.parentElement;
          }
          document
            .getElementById("timetable")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <thead>
          {timetableTemplateData.slice(0, 4).map((row, rowIndex) => {
            return (
              <tr key={`${id}-row-${rowIndex}`}>
                {row.map((cell, index) => {
                  return cell === "" ? null : (
                    <th
                      key={`${id}-${rowIndex}-${index}`}
                      className={getClassName(
                        cell,
                        rowIndex,
                        index,
                        styles,
                        slots,
                        dayCount
                      )}
                      rowSpan={index === 0 ? 2 : 1}
                    ></th>
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
                  return cell === "" ? null : (
                    <td
                      key={`${id}-${rowIndex}-${cellIndex}`}
                      className={`${getClassName(
                        cell,
                        rowIndex + 4,
                        cellIndex,
                        styles,
                        slots,
                        dayCount
                      )}`}
                      rowSpan={cellIndex === 0 ? 2 : 1}
                    ></td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default TimetablePreview;
