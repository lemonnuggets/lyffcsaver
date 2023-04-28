export const isClientMobile = () => {
  const mql = window.matchMedia("(max-width: 750px)");
  if (
    // /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( //   navigator.userAgent // ) &&
    mql.matches
  ) {
    return true;
  }
  return false;
};
