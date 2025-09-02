import React from "react";
import { getCurrentUser } from "../helpers/auth";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import BGMHero from "components/hero/BGMHero";
import Features from "components/features/VerticalWithAlternateImageAndText.js";
import Testimonial from "components/testimonials/TwoColumnWithImage.js";
import Footer from "components/footers/SimpleFiveColumn.js";
import Leaderboard from "pages/Leaderboard.js";
import RegistrationSteps from "components/steps/RegistrationSteps";

export default function BGMLandingPage() {
  const user = getCurrentUser();
  return (
    <AnimationRevealPage>
      
      <BGMHero />
      <RegistrationSteps />
      <Features />
      <Testimonial />
      <Leaderboard />
      <Footer />
    </AnimationRevealPage>
  );
}




