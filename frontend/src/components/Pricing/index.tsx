"use client";
import { useState } from "react";
import SectionTitle from "../Common/SectionTitle";
import OfferList from "./OfferList";
import PricingBox from "./PricingBox";

const Pricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);

  return (
    <section id="pricing" className="relative z-10 py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle
          title="Available at Affordable Prices"
          paragraph="Explore high-quality services tailored to fit your budget."
          center
          width="665px"
        />

        <div className="w-full">
          <div className="mb-8 flex justify-center md:mb-12 lg:mb-16">
            <span
              onClick={() => setIsMonthly(true)}
              className={`${
                isMonthly
                  ? "pointer-events-none text-primary"
                  : "text-dark dark:text-white"
              } mr-4 cursor-pointer text-base font-semibold`}
            >
              Monthly
            </span>
            <div
              onClick={() => setIsMonthly(!isMonthly)}
              className="flex cursor-pointer items-center"
            >
              <div className="relative">
                <div className="h-5 w-14 rounded-full bg-[#1D2144] shadow-inner"></div>
                <div
                  className={`${
                    isMonthly ? "" : "translate-x-full"
                  } shadow-switch-1 absolute left-0 top-[-4px] flex h-7 w-7 items-center justify-center rounded-full bg-primary transition`}
                >
                  <span className="active h-4 w-4 rounded-full bg-white"></span>
                </div>
              </div>
            </div>
            <span
              onClick={() => setIsMonthly(false)}
              className={`${
                isMonthly
                  ? "text-dark dark:text-white"
                  : "pointer-events-none text-primary"
              } ml-4 cursor-pointer text-base font-semibold`}
            >
              Yearly
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          <PricingBox
            packageName="Basic Plan"
            price={isMonthly ? "1,500" : "15,000 "}
            duration={isMonthly ? "mo" : "yr"}
            subtitle="For emerging artists, this plan offers an affordable way to showcase their talent, 
            with a yearly subscription saving you ₹3,000 compared to the monthly plan."
          >
            <OfferList text="Exhibition space for 1 artwork per month" status="active" />
            <OfferList text="Featured on social media stories" status="active" />
            <OfferList text="Listing on the Fameuxarte website" status="active" />
            <OfferList text="Email Support" status="inactive" />
            <OfferList text="Lifetime Access" status="inactive" />
            <OfferList text="Free Lifetime Updates" status="inactive" />
          </PricingBox>
          <PricingBox
            packageName=" Professional Plan "
            price={isMonthly ? "3,500" : "35,000"}
            duration={isMonthly ? "mo" : "yr"}
            subtitle="Perfect for artists looking to expand their reach, this plan provides enhanced visibility and networking opportunities, 
            helping you take the next step in your career—save ₹7,000 with this plan!"
          >
            <OfferList text="Exhibition space for up to 3 artworks per month" status="active" />
            <OfferList text="Dedicated social media post & artist spotlight" status="active" />
            <OfferList text="Promotion on the Fameuxarte website & newsletter" status="active" />
            <OfferList text="Access to artist networking events" status="active" />
            <OfferList text="Lifetime Access" status="active" />
            <OfferList text="Free Lifetime Updates" status="inactive" />
          </PricingBox>
          <PricingBox
            packageName="Premium Plan "
            price={isMonthly ? "7,500" : "75,000 "}
            duration={isMonthly ? "mo" : "yr"}
            subtitle="For Established Artists & Collectors: Designed for seasoned artists and passionate collectors, this premium plan offers exclusive features, priority promotions, and a curated experience tailored to 
            elevate your art journey—save ₹15,000 with this plan!"
          >
            <OfferList text="Exhibition space for up to 5 artworks per month" status="active" />
            <OfferList text="Full-featured artist profile on the website" status="active" />
            <OfferList text="Custom marketing campaign (including video promotion)" status="active" />
            <OfferList text="Exclusive participation in high-end exhibitions" status="active" />
            <OfferList text="Priority placement in gallery displays" status="active" />
            <OfferList text="Free Lifetime Updates" status="active" />
          </PricingBox>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 z-[-1]">
        <svg
          width="239"
          height="601"
          viewBox="0 0 239 601"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            opacity="0.3"
            x="-184.451"
            y="600.973"
            width="196"
            height="541.607"
            rx="2"
            transform="rotate(-128.7 -184.451 600.973)"
            fill="url(#paint0_linear_93:235)"
          />
          <rect
            opacity="0.3"
            x="-188.201"
            y="385.272"
            width="59.7544"
            height="541.607"
            rx="2"
            transform="rotate(-128.7 -188.201 385.272)"
            fill="url(#paint1_linear_93:235)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_93:235"
              x1="-90.1184"
              y1="420.414"
              x2="-90.1184"
              y2="1131.65"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4A6CF7" />
              <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_93:235"
              x1="-159.441"
              y1="204.714"
              x2="-159.441"
              y2="915.952"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4A6CF7" />
              <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};

export default Pricing;
