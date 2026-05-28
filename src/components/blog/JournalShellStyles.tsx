import { useEffect } from "react";

const JournalShellStyles = () => {
  useEffect(() => {
    document.body.classList.add("journal-route-active");
    return () => {
      document.body.classList.remove("journal-route-active");
    };
  }, []);

  return (
    <style>
      {`
        body.journal-route-active nav.fixed,
        body.journal-route-active footer {
          display: none;
        }

        body.journal-route-active main {
          padding-top: 0;
        }
      `}
    </style>
  );
};

export default JournalShellStyles;

