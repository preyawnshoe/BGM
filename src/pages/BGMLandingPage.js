import React from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import BGMHero from "components/hero/BGMHero";
import Features from "components/features/VerticalWithAlternateImageAndText.js";
import Testimonial from "components/testimonials/TwoColumnWithImage.js";
import Footer from "components/footers/SimpleFiveColumn.js";
import Leaderboard from "pages/Leaderboard.js";

export default function BGMLandingPage() {
  return (
    <AnimationRevealPage>
      <BGMHero />
      <Features />
      <Testimonial />
      <Leaderboard />
      <Footer />
    </AnimationRevealPage>
  );
}




