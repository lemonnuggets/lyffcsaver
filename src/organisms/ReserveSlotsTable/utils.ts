import timetableStyles from "@/styles/Timetable.module.css";
import styles from "./ReserveSlotsTable.module.css";
export const getClassName = (
  cellContent: string,
  rowIndex: number,
  cellIndex: number,
  reservedSlots: Array<string>,
  dayCount: number
) => {
  let className = `${styles.cell} ${timetableStyles.cell} `;
  const pattern = /[A-Z]+\d+/;
  if (pattern.test(cellContent)) className += ` ${styles.slotCell} `;
  if (cellIndex < 2) {
    className += ` ${timetableStyles.headDay} `;
    return className;
  }
  if (rowIndex < 2) {
    className += ` ${timetableStyles.theoryTiming} `;
  }
  if (rowIndex >= 2 && rowIndex < 4) {
    className += ` ${timetableStyles.labTiming} `;
  }
  if (rowIndex < 4) {
    className += ` ${timetableStyles.cell} ${timetableStyles.headTop} `;
    return className;
  }
  if (cellContent === "Lunch") {
    className += ` ${timetableStyles.lunch} `;
    return className;
  }
  if (reservedSlots.includes(cellContent)) {
    className += ` ${styles.reserved} `;
    return className;
  }
  if (dayCount % 2 === 0) {
    className += ` ${timetableStyles.evenDay} `;
    return className;
  } else {
    className += ` ${timetableStyles.oddDay} `;
    return className;
  }
};
export default {
  getClassName,
};
