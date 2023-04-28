import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  clearClassesFromSelectedCourse,
  removeClassFromSelectedCourse,
  setReorderedClasses,
} from "@/app/reducers/classes";
import dragHandle from "@/assets/dragHandle.svg";
import Button from "@/atoms/Button";
import StrictModeDroppable from "@/atoms/StrictModeDroppable";
import {
  DragDropContext,
  Draggable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import styles from "./ClassPreference.module.css";
const ClassPreference = () => {
  const { selectedCourseID, selectedClasses } = useAppSelector(
    (state) => state.class
  );
  const dispatch = useAppDispatch();
  const classes =
    selectedCourseID !== null ? selectedClasses[selectedCourseID] : [];
  const handleOnDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) return;

    const newClasses = [...classes];
    const [reorderedItem] = newClasses.splice(result.source.index, 1);
    newClasses.splice(result.destination.index, 0, reorderedItem);
    dispatch(setReorderedClasses(newClasses));
  };
  return (
    <div className={styles.container}>
      <div className={styles.classPriority}>
        <div className={`${styles.title} body1-bold`}>Class Priority</div>
        <div className={styles.addedClasses} id="class-priority">
          <div className={styles.resultsWrapper}>
            {classes?.length > 0 ? (
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <StrictModeDroppable droppableId="classes-priority-list">
                  {(provided) => (
                    <ul
                      key={"classes-list"}
                      className={styles.classesList}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {classes?.map((classData, index) => {
                        return (
                          <Draggable
                            draggableId={`${classData["CLASS ID"]}-priority-select`}
                            key={`${classData["CLASS ID"]}-priority-select`}
                            index={index}
                          >
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                key={`${classData["CLASS ID"]}-priority-select-c`}
                                className={`${styles.class} draggable-class`}
                                {...provided.draggableProps}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className={styles.handle}
                                >
                                  <img src={dragHandle} alt="drag" />
                                </div>
                                <div className={styles.classContent}>
                                  <div
                                    className={`${styles.facultyName} body1-bold`}
                                  >
                                    {classData["EMPLOYEE NAME"]}
                                  </div>
                                  <a
                                    className={styles.delete}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      dispatch(
                                        removeClassFromSelectedCourse(classData)
                                      );
                                    }}
                                  >
                                    X
                                  </a>
                                  <div className={styles.erpId}>
                                    {classData["ERP ID"]}
                                  </div>
                                  <div className={styles.classSlots}>
                                    {classData["SLOT"]}
                                  </div>
                                </div>
                              </li>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </ul>
                  )}
                </StrictModeDroppable>
              </DragDropContext>
            ) : (
              <></>
            )}
            {/* {classes?.map((classData) => {
              return (
                <div
                  className={styles.class}
                  key={`selected-class-${classData["CLASS ID"]}`}
                ></div>
              );
            })} */}
          </div>
          <Button
            classes={`${styles.addClassesButton}`}
            type="primary"
            clickedCallback={() => {
              document
                .querySelector("#class-selection-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            disabled={selectedCourseID?.length === 0}
          >
            ADD CLASSES +
          </Button>
          <div className={styles.buttons}>
            <Button
              type="clear"
              clickedCallback={() => {
                // classes?.forEach((classData) => removeClass(classData));
                dispatch(clearClassesFromSelectedCourse());
              }}
              disabled={selectedCourseID?.length === 0}
            >
              CLEAR
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassPreference;
