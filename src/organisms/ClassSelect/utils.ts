import classesData from "@/data/classes.json";
import coursesData from "@/data/courses.json";
import facultiesData from "@/data/faculties.json";
import { Class, ExtendedClass } from "@/types";
import { getCourseID } from "@/utils/generalUtils";

export const getCourseTitle = (classData: Class) => {
  const course = coursesData.find(
    (courseData) => getCourseID(courseData) === getCourseID(classData)
  );
  if (course !== undefined) return course["COURSE TITLE"];
  return "";
};
export const getFacultyName = (classData: Class) => {
  const faculty = facultiesData.find(
    (facultyData) => facultyData["ERP ID"] === classData["ERP ID"]
  );

  if (faculty !== undefined) return faculty["EMPLOYEE NAME"];
  return "";
};
export const toExtendedClass = (classData: Class) => {
  return {
    ...classData,
    "COURSE TITLE":
      "COURSE TITLE" in classData
        ? (classData["COURSE TITLE"] as string)
        : getCourseTitle(classData),
    "EMPLOYEE NAME":
      "EMPLOYEE NAME" in classData
        ? (classData["EMPLOYEE NAME"] as string)
        : getFacultyName(classData),
  } as ExtendedClass;
};
export const toExtendedClasses = (classes: Array<Class>) => {
  return classes.map((classData) => {
    return toExtendedClass(classData);
  });
};
export const getAvailableClasses = (selectedCourseID: string) => {
  const availableClasses = classesData.filter(
    (classData) => getCourseID(classData) === selectedCourseID
  );
  return toExtendedClasses(availableClasses);
};
export const isTheoryComponent = (classData: Class) => {
  return classData["COURSE TYPE"] === "ETH";
};
export const isLabComponent = (classData: Class) => {
  return classData["COURSE TYPE"] === "ELA";
};
