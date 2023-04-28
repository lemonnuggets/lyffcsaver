import { useAppSelector } from "@/app/hooks";
import cameraImg from "@/assets/camera.svg";
import Timetable from "@/atoms/Timetable";
import { Class, ClassesByCourseID, Schedule } from "@/types";
import { isUnique } from "@/utils/generalUtils";
import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import ClassTable from "../ClassTable";
import Classes from "../Classes";
import styles from "./Timetables.module.css";
import { getCanvasFromNode, getScalingFactor } from "./utils";

const Timetables = () => {
  const { schedules, selectedSlotCombination: slots } = useAppSelector(
    (state) => state.schedules
  );
  const { selectedClasses: classes } = useAppSelector((state) => state.class);
  // console.log("rerendering Timetables(", schedules, slots, faculties, ")");
  const [schedule, setSchedule] = useState<Schedule>({});
  const [hoveredSlots, setHoveredSlots] = useState<Array<string>>([]);

  useEffect(() => {
    setHoveredSlots([]);
  }, [slots]);
  const getScore = (courseID: string, classData: Class) => {
    return (
      (classes[courseID]?.length -
        classes[courseID]?.findIndex(
          (_classData) => _classData["CLASS ID"] === classData["CLASS ID"]
        )) /
      classes[courseID]?.length
    );
  };
  const hasValidSelections = () => {
    const currentSchedules = schedules[slots.join("+")];
    if (currentSchedules === undefined || currentSchedules[0] === undefined)
      return false;
    const courseIDs = Object.keys(currentSchedules[0]);
    const facultiesByCourseCode: {
      [courseCode: string]: {
        [courseType: string]: Set<string>;
      };
    } = {};
    console.log({ currentSchedules });
    courseIDs.forEach((courseID) => {
      // const courseCode = currentSchedules[courseID][0][ "COURSE CODE" ]
      // const courseType = currentSchedules[courseID][0][ "COURSE TYPE" ]
      const [courseCode, courseType] = courseID.split("-");
      if (facultiesByCourseCode[courseCode] === undefined)
        facultiesByCourseCode[courseCode] = {};
      if (facultiesByCourseCode[courseCode][courseType] === undefined)
        facultiesByCourseCode[courseCode][courseType] = new Set();
      // facultiesByCourseCode[courseCode][courseType].push(currentSchedules)
      currentSchedules.forEach((schedule) =>
        facultiesByCourseCode[courseCode][courseType].add(
          schedule[courseID]["ERP ID"]
        )
      );
    });
    for (const courseCode of Object.keys(facultiesByCourseCode)) {
      const faculties = new Set();
      let totalFacultiesInEachComponent = 0;
      for (const courseType of Object.keys(facultiesByCourseCode[courseCode])) {
        facultiesByCourseCode[courseCode][courseType].forEach((erpID) =>
          faculties.add(erpID)
        );
        totalFacultiesInEachComponent +=
          facultiesByCourseCode[courseCode][courseType].size;
      }
      if (faculties.size < totalFacultiesInEachComponent) continue;
      else return false;
    }
    return true;
  };
  return (
    <div id="#timetables-screen" className={styles.timetablesScreen}>
      <Timetable
        schedule={schedule}
        slots={slots}
        hoveredSlots={hoveredSlots}
        hasValidSelections={hasValidSelections}
      ></Timetable>
      {slots !== undefined && slots.length > 0 ? (
        <>
          <div className={styles.buttons}>
            <input
              type="image"
              src={cameraImg}
              alt="Download timetable image"
              onClick={async () => {
                const table = document.getElementById("filled-out-timetable");
                // console.log("clicked", courseIDs, schedules, selectedClasses);
                // const courseIDs = Object.keys(selectedClasses);
                const selectedSchedules = schedules[slots.join("+")];
                const courseIDs =
                  selectedSchedules?.length > 0
                    ? Object.keys(selectedSchedules[0])
                    : [];
                const classes: ClassesByCourseID = {};
                selectedSchedules?.forEach((schedule) =>
                  courseIDs?.forEach((courseID) => {
                    if (classes[courseID] === undefined) classes[courseID] = [];
                    if (
                      isUnique(
                        "CLASS ID",
                        classes[courseID],
                        schedule[courseID]
                      )
                    )
                      classes[courseID].push(schedule[courseID]);
                  })
                );
                courseIDs.sort((a, b) => classes[b].length - classes[a].length);
                const canvases = [await getCanvasFromNode(table)];

                for (const courseID of courseIDs) {
                  console.log("clicked", courseID);
                  const Table = () => (
                    <ClassTable
                      courseIDs={courseIDs}
                      schedules={selectedSchedules}
                      courseID={courseID}
                      selectedClasses={schedule}
                      slots={slots}
                      getScore={getScore}
                    ></ClassTable>
                  );

                  const node = document.createElement("div");
                  node.style.display = "flex";
                  node.style.flexDirection = "column";
                  node.style.alignItems = "center";

                  ReactDOM.render(<Table />, node);
                  const canvas = await getCanvasFromNode(node);
                  console.log(canvas, node);
                  canvases.push(canvas);
                }

                const dataURLs = canvases.map((canvas) =>
                  canvas?.toDataURL("image/png")
                );
                const height = 793.706;
                const width = 1122.52;
                const pdf = new jsPDF({
                  unit: "px",
                  hotfixes: ["px_scaling"],
                  orientation: "landscape",
                });
                // let currentHeight = 30
                canvases.forEach((canvas, index) => {
                  if (canvas === null) return;
                  const sf = getScalingFactor(
                    canvas.width,
                    canvas.height,
                    width,
                    height
                  );
                  const dataURL = dataURLs[index];
                  if (dataURL === undefined) return;
                  pdf.addImage(
                    dataURL,
                    "PNG",
                    width / 2 - (canvas.width * sf) / 2,
                    height / 2 - (canvas.height * sf) / 2,
                    canvas.width * sf,
                    canvas.height * sf
                  );
                  pdf.addPage();
                });
                pdf.deletePage(pdf.getNumberOfPages());
                pdf.save(`timetable-${slots.join("+")}.pdf`);
                const elements = [];
                elements.push(document.getElementById("filled-out-timetable"));
              }}
            />
          </div>
          <Classes
            // schedules={schedules[slots.join("+")]}
            // slots={slots}
            currentSchedule={schedule}
            setCurrentSchedule={setSchedule}
            setHoveredSlots={setHoveredSlots}
            getScore={getScore}
          ></Classes>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Timetables;
