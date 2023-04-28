import html2canvas from "html2canvas";
export const hiddenClone = (element: HTMLElement | null) => {
  if (element === null) return null;
  // Create clone of element
  const clone = element.cloneNode(true) as HTMLElement;

  // Position element relatively within the
  // body but still out of the viewport
  // document.querySelector().style.z
  const style = clone.style;
  style.position = "relative";
  // style.top = window.innerHeight + "px";
  style.left = "0";
  style.zIndex = "10000";
  clone.id = element.id + "clone";

  // Append clone to body and return the clone
  // document..appendChild(clone);
  // document.body.firstChild.after(clone);
  document.querySelector("#root")?.firstChild?.after(clone);
  // clone.scrollIntoView();
  return clone;
};

export const getCanvasFromNode = async (node: HTMLElement | null) => {
  // Clone off-screen element
  const clone = hiddenClone(node);
  // clone?.scrollIntoView({ behavior: "smooth" });
  if (clone === null) return null;
  const canvas = await html2canvas(clone, {
    // allowTaint: true,
    // backgroundColor: "#000",
    // foreignObjectRendering: true,
    // logging: true,
    // useCORS: true,
    scrollY: -window.scrollY,
  });
  clone.parentElement?.removeChild(clone);
  return canvas;
};

export const getScalingFactor = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) => {
  console.log(width, height, maxWidth, maxHeight);
  const fr1 = maxWidth / width;
  const fr2 = maxHeight / height;
  if (fr1 >= 1 && fr2 >= 1) return 1;
  return fr1 < fr2 ? fr1 : fr2;
};
