import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { deselectSlotCombination } from "@/app/reducers/schedules";
import leftArrow from "@/assets/leftArrow.svg";
import rightArrow from "@/assets/rightArrow.svg";
import TimetablePreview from "@/atoms/TimetablePreview";
import timetableStyles from "@/styles/Timetable.module.css";
import { useState } from "react";
import ReactPaginate from "react-paginate";
import styles from "./TimetablePreviews.module.css";

// using code from
// https://ihsavru.medium.com/react-paginate-implementing-pagination-in-react-f199625a5c8e
// for pagination.
const TimetablePreviews = () => {
  const { schedules } = useAppSelector((state) => state.schedules);
  const dispatch = useAppDispatch();
  const slotCombinations = Object.keys(schedules);
  const previewsPerPage = 12;
  const pageCount = Math.ceil(slotCombinations.length / previewsPerPage);
  const [currentPage, setCurrentPage] = useState(0);
  const currentPageData = slotCombinations
    .slice(currentPage * previewsPerPage, (currentPage + 1) * previewsPerPage)
    .map((slotsString) => {
      const slots = slotsString.split("+");
      return (
        <TimetablePreview
          key={`${slotsString}-timetable`}
          id={`${slotsString}-timetable`}
          slots={slots}
        ></TimetablePreview>
      );
    });
  const leftArrowNode = <img src={leftArrow} alt="<" />;
  const rightArrowNode = <img src={rightArrow} alt=">" />;
  return (
    <div className={styles.panel}>
      <div className={timetableStyles.legend}>
        <div className={timetableStyles.theoryLegend}>
          <div className={timetableStyles.colorExample}></div>
          <div className={timetableStyles.legendLabel}>Theory Slot</div>
        </div>
        <div className={timetableStyles.labLegend}>
          <div className={timetableStyles.colorExample}></div>
          <div className={timetableStyles.legendLabel}>Lab Slot</div>
        </div>
      </div>
      <div className={styles.container}>{currentPageData}</div>
      <ReactPaginate
        previousLabel={leftArrowNode}
        nextLabel={rightArrowNode}
        pageCount={pageCount}
        onPageChange={({ selected }) => {
          // console.log("page change");
          setCurrentPage(selected);
          dispatch(deselectSlotCombination());
        }}
        containerClassName={styles.paginatedPreviews}
        pageClassName={styles.page}
        previousLinkClassName={styles.previous}
        nextLinkClassName={styles.next}
        disabledClassName={styles.disabled}
        activeClassName={styles.active}
        forcePage={currentPage}
      ></ReactPaginate>
    </div>
  );
};

export default TimetablePreviews;
