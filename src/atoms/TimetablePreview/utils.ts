export const getClassName = (
  cellContent: string,
  rowIndex: number,
  cellIndex: number,
  styles: CSSModuleClasses,
  slots: Array<string>,
  dayCount: number
) => {
  let className = `${styles.cell} `;
  if (cellIndex < 2) {
    className += `${styles.headDay}`;
    return className;
  }
  if (rowIndex < 2) {
    className += ` ${styles.theoryTiming} `;
  }
  if (rowIndex >= 2 && rowIndex < 4) {
    className += ` ${styles.labTiming} `;
  }
  if (rowIndex < 4) {
    className += ` ${styles.cell} ${styles.headTop} `;
    return className;
  }
  if (cellContent === "Lunch") {
    className += `${styles.lunch}`;
    return className;
  }
  if (slots.includes(cellContent)) {
    if (rowIndex % 2 === 0) {
      className += `${styles.theory}`;
      return className;
    } else {
      className += `${styles.lab}`;
      return className;
    }
  }
  if (dayCount % 2 === 0) {
    className += `${styles.evenDay}`;
    return className;
  } else {
    className += `${styles.oddDay}`;
    return className;
  }
};
