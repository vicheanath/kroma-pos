import * as React from "react";

const TABLET_MIN = 768;
const TABLET_MAX = 1024;

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= TABLET_MIN && width <= TABLET_MAX);
    };

    const mql = window.matchMedia(
      `(min-width: ${TABLET_MIN}px) and (max-width: ${TABLET_MAX}px)`
    );
    const onChange = () => {
      checkTablet();
    };

    mql.addEventListener("change", onChange);
    checkTablet();

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isTablet;
}
