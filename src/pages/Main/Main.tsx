import Options from "@/organisms/Options";
import TimetablesSection from "@/organisms/TimetablesSection";
import { Container } from "react-bootstrap";
import styles from "./Main.module.css";
import { isClientMobile } from "./utils";

const Main = () => {
  return (
    <Container className={styles.container}>
      {isClientMobile() ? (
        <>Site not made for mobile use. Please open on a larger screen.</>
      ) : (
        <>
          <Options />
          <TimetablesSection></TimetablesSection>
        </>
      )}
    </Container>
  );
};

export default Main;
