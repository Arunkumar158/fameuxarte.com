
import MainLayout from "@/components/layouts/MainLayout";

const OurStory = () => {
  return (
    <MainLayout>
      <div className="container py-12 md:py-16">
        <h1 className="text-4xl font-bold text-center mb-8">Our Story</h1>
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <h2>Our Beginning</h2>
          <p>
            Founded in 2024, Fameuxarte emerged from a passion for connecting
            exceptional artists with art enthusiasts worldwide. Our journey began
            when a group of art lovers recognized the need for a more accessible
            and transparent way to discover and collect contemporary art.
          </p>

          <h2>Our Mission</h2>
          <p>
            At Fameuxarte, we believe that art has the power to transform spaces
            and inspire minds. Our mission is to make exceptional artwork
            accessible to collectors worldwide while supporting emerging and
            established artists in their creative journey.
          </p>

          <h2>Our Values</h2>
          <ul>
            <li>
              <strong>Authenticity:</strong> Every artwork in our collection is
              verified and comes with a certificate of authenticity.
            </li>
            <li>
              <strong>Transparency:</strong> We believe in clear communication
              about pricing, shipping, and artwork details.
            </li>
            <li>
              <strong>Support for Artists:</strong> We provide a platform that
              empowers artists to reach a global audience while maintaining
              creative control.
            </li>
            <li>
              <strong>Quality:</strong> We carefully curate our collection to
              ensure the highest standards of artistic excellence.
            </li>
          </ul>

          <h2>Our Community</h2>
          <p>
            We've built a vibrant community of artists, collectors, and art
            enthusiasts who share our passion for contemporary art. Through our
            platform, we facilitate meaningful connections between creators and
            collectors, fostering a deeper appreciation for art in all its forms.
          </p>

          <h2>Looking Forward</h2>
          <p>
            As we continue to grow, our commitment to supporting artists and
            providing exceptional service to our collectors remains unwavering. We
            invite you to join us on this artistic journey and discover the
            transformative power of contemporary art.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default OurStory;
