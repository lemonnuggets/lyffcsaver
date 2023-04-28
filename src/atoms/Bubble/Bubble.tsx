import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toggleReserve } from "@/app/reducers/reserveSlots";
import timetableTemplateData from "../../utils/timetableTemplateData";
import styles from "./Bubble.module.css";

type BubbleProps = {
  cellContent: string;
  row: number;
  col: number;
};
const Bubble = ({ cellContent, row, col }: BubbleProps) => {
  const reservedSlots = useAppSelector((state) => state.reserve.reservedSlots);
  const dispatch = useAppDispatch();
  let alreadyShown = false;
  // for (let i = 0; i < row; i++)
  //   for (let j = 0; j < timetableTemplateData[row].length; j++)
  //     if (cellContent === timetableTemplateData[i][j]) alreadyShown = true;
  for (let i = 0; i < row; i++)
    if (timetableTemplateData[i].includes(cellContent)) alreadyShown = true;
  for (let j = 0; j < col; j++)
    if (cellContent === timetableTemplateData[row][j]) alreadyShown = true;
  if (alreadyShown) return <></>;
  const pattern = /[A-Z]+\d+/;
  if (pattern.test(cellContent)) {
    return (
      <a
        className={`${styles.bubble} ${
          reservedSlots.includes(cellContent) ? styles.reserved : ""
        }`}
        onClick={() => dispatch(toggleReserve(cellContent))}
      >
        {cellContent}
      </a>
    );
  }
  return <></>;
};
export default Bubble;
