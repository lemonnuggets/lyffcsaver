import Bubble from "../../atoms/Bubble/Bubble";
import timetableTemplateData from "../../utils/timetableTemplateData";
import styles from "./ReserveSlotsBubbles.module.css";
const ReserveSlotsBubbles = () => {
  return (
    <div className={styles.container}>
      <div className={styles.col}>
        {timetableTemplateData.slice(4).map((row, rowIndex) => {
          return (
            <div
              className={styles.row}
              key={`reserve-bubble-morning-${rowIndex}`}
            >
              {row.slice(2, 9).map((cell, cellIndex) => (
                <Bubble
                  cellContent={cell}
                  row={rowIndex + 4}
                  col={cellIndex + 2}
                  key={`reserve-bubble-${rowIndex}-${cellIndex}`}
                ></Bubble>
              ))}
            </div>
          );
        })}
      </div>
      <span className={styles.separator}></span>
      <div className={styles.col}>
        {timetableTemplateData.slice(4).map((row, rowIndex) => {
          return (
            <div
              className={styles.row}
              key={`reserve-bubble-evening-${rowIndex}`}
            >
              {row.slice(9).map((cell, cellIndex) => (
                <Bubble
                  cellContent={cell}
                  row={rowIndex + 4}
                  col={cellIndex + 9}
                  key={`reserve-bubble-${rowIndex}-${cellIndex}`}
                ></Bubble>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReserveSlotsBubbles;
