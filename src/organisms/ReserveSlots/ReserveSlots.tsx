import ReserveSlotsBubbles from "@/organisms/ReserveSlotsBubbles";
import ReserveSlotsTable from "@/organisms/ReserveSlotsTable";
import styles from "./ReserveSlots.module.css";

type Props = {
  view: number;
};
const ReserveSlots = ({ view }: Props) => {
  return (
    <div
      className={`${styles.container} ${
        view === 0 ? styles.container1 : styles.container2
      }`}
    >
      <div
        className={`${styles.wrapper1} ${
          view === 0 ? styles.inactive : styles.active
        }`}
      >
        <ReserveSlotsTable></ReserveSlotsTable>
      </div>
      <div
        className={`${styles.wrapper2} ${
          view === 1 ? styles.inactive : styles.active
        }`}
      >
        <ReserveSlotsBubbles></ReserveSlotsBubbles>
      </div>
    </div>
  );
};

export default ReserveSlots;
