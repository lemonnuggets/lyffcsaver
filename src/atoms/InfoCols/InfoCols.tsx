import { Class } from "@/types";
import { MouseEventHandler } from "react";

type Props<
  T extends {
    [key: string]: string;
  }
> = {
  onClick?: MouseEventHandler;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
  styles: CSSModuleClasses;
  ignoreCols: Array<string>;
  keys: Array<string>;
  entry: T;
  getID: (entry: T) => string;
};
const InfoCols = <
  T extends {
    [key: string]: string;
  } = Class
>({
  keys,
  entry,
  getID,
  styles,
  ignoreCols,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: Props<T>) => {
  return (
    <>
      {keys.map((key) => {
        if (
          ignoreCols === undefined ||
          (ignoreCols && !ignoreCols.includes(key))
        )
          return (
            <td
              className={styles.cell + " " + styles[key]}
              key={getID(entry) + "-c-" + key}
              onClick={onClick}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              {entry[key]}
            </td>
          );
      })}
    </>
  );
};

export default InfoCols;
