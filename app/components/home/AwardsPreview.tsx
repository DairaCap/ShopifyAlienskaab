import { awardSummary } from "../../data/awards";
import ScrollReveal from "../ScrollReveal";
import DomeGallery from "./DomeGallery";

export default function AwardsPreview() {
  return (
    <section className="section awards-preview" id="premios">
      <div className="container">
        <ScrollReveal as="header" className="section__header">
          <p className="section__eyebrow">Reconocimientos oficiales</p>
          <h2 className="section__title">Medallero Aliens Kaab</h2>
          <p className="section__lead">
            {awardSummary.totalRecognitions} reconocimientos · {awardSummary.totalMedals}{" "}
            medallas en competencias nacionales e internacionales
          </p>
        </ScrollReveal>
      </div>
      <div style={{ width: '100%', maxWidth: '100%', height: '100vh' }}>
        <DomeGallery
          fit={1}
          minRadius={1000}
          maxVerticalRotationDeg={11}
          segments={20}
          dragDampening={2.2}
          grayscale={false}
        />
      </div>
    </section>
  );
}
