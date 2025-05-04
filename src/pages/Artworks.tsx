
import MainLayout from "@/components/layouts/MainLayout";
import ArtworkGrid from "@/components/ArtworkGrid";
import SectionTitle from "@/components/shared/SectionTitle";

const Artworks = () => {
  return (
    <MainLayout>
      <div className="container py-12">
        <SectionTitle
          title="Artworks Gallery"
          subtitle="Explore our curated collection of exceptional artworks"
        />
        <ArtworkGrid />
      </div>
    </MainLayout>
  );
};

export default Artworks;
