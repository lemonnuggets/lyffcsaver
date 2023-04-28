import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toggleReserve } from "@/app/reducers/reserveSlots";
import timetableStyles from "../../styles/Timetable.module.css";
import timetableTemplateData from "../../utils/timetableTemplateData";
import styles from "./ReserveSlotsTable.module.css";
import { getClassName } from "./utils";

const ReserveSlotsTable = () => {
  const reservedSlots = useAppSelector((state) => state.reserve.reservedSlots);
  const dispatch = useAppDispatch();

  let dayCount = 0;
  const id = "reserve-slots";
  return (
    <div className={styles.timetableWrapper}>
      <table className={`${timetableStyles.timetable} ${styles.timetable}`}>
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
                        reservedSlots,
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
                  return cell === "" ||
                    cellIndex === 1 ||
                    (rowIndex > 0 && cell === "Lunch") ? null : (
                    <td
                      key={`${id}-${rowIndex}-${cellIndex}`}
                      className={`${getClassName(
                        cell,
                        rowIndex + 4,
                        cellIndex,
                        reservedSlots,
                        dayCount
                      )}`}
                      rowSpan={cell === "Lunch" ? 14 : cellIndex === 0 ? 2 : 1}
                      onMouseDown={() => dispatch(toggleReserve(cell))}
                      onMouseEnter={(e) => {
                        if (e.buttons === 1) dispatch(toggleReserve(cell));
                      }}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReserveSlotsTable;
