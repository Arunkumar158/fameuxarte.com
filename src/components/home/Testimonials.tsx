
import { Separator } from "@/components/ui/separator";

// Mock data for demonstration
const testimonials = [
  {
    id: 1,
    quote: "The artwork I purchased from Fameuxarte exceeded my expectations. The quality and craftsmanship are outstanding, and it's now the centerpiece of my living room.",
    author: "Sarah Thompson",
    location: "New York, USA",
    rating: 5,
  },
  {
    id: 2,
    quote: "I've been collecting art for years, and Fameuxarte offers one of the best curated selections I've seen. The customer service is excellent, and the shipping was handled with great care.",
    author: "Michael Chen",
    location: "London, UK",
    rating: 5,
  },
  {
    id: 3,
    quote: "As an interior designer, I regularly recommend Fameuxarte to my clients. The variety of styles and price points makes it easy to find the perfect piece for any space.",
    author: "Isabella Martinez",
    location: "Barcelona, Spain",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="section-padding bg-gradient-to-b from-black to-brand-black">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
            Client <span className="text-gradient">Testimonials</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-brand-red to-brand-blue mx-auto mb-6"></div>
          <p className="text-lg max-w-2xl mx-auto text-gray-300 animate-slide-up delay-100">
            Hear from art collectors and enthusiasts who have experienced the Fameuxarte difference
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className="glass-card p-8 rounded-lg animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-brand-red"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                ))}
              </div>
              <blockquote className="relative">
                <span className="text-5xl absolute -top-3 -left-2 text-brand-red opacity-30">"</span>
                <p className="text-gray-300 z-10 relative">{testimonial.quote}</p>
                <span className="text-5xl absolute bottom-0 right-0 text-brand-red opacity-30">"</span>
              </blockquote>
              <Separator className="my-6 bg-white/20" />
              <div>
                <p className="font-heading font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
