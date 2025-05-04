import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";

const Features = () => {
  return (
    <>
      <section id="features" className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <SectionTitle
            title="Our Services"
            paragraph="At Fameuxarte, we're more than just an online art store — we are a creative hub where artists thrive and art lovers discover meaningful pieces. Our services are thoughtfully designed to support artists, engage collectors, and make the art-buying experience seamless and inspiring. Whether you're looking to buy, commission, or simply explore, we’re here to connect you with the power of art."
            center
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature) => (
                <SingleFeature key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
