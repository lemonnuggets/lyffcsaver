import { PropsWithChildren } from "react";
import styles from "./Button.module.css";
type Props = {
  disabled?: boolean;
  clickedCallback?: (e: any) => any;
  classes?: string;
  type?: "primary" | "clear";
  id?: string;
};
const Button = ({
  children,
  disabled,
  clickedCallback,
  ...allProps
}: PropsWithChildren<Props>) => {
  let className = "";
  if (allProps["type"] === "primary") className = styles.primary;
  if (allProps["type"] === "clear") className = styles.clear;

  return (
    <a
      className={`${styles.button} ${
        disabled ? styles.disabled : ""
      } ${className} ${allProps["classes"]}`}
      onClick={(e) => {
        if (!disabled && clickedCallback) clickedCallback(e);
      }}
      {...allProps}
    >
      {children}
    </a>
  );
};

export default Button;
