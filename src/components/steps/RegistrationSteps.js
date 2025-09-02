import React from "react";


import ThreeColSimple from "components/features/ThreeColSimple";
import step1 from "images/steps/step1.svg";
import step2 from "images/steps/step2.svg";
import step3 from "images/steps/step3.svg";
import step4 from "images/steps/step4.svg";
import step5 from "images/steps/step5.svg";
import step6 from "images/steps/step6.svg";

const cards = [
  {
    imageSrc: step1,
    title: "Start Registration",
    description: "Click the 'Register to Get Referral Link' button above.",
    url: "#register"
  },
  {
    imageSrc: step2,
    title: "Fill Details",
    description: "Enter your name and email on the registration page.",
    url: "#form"
  },
  {
    imageSrc: step3,
    title: "Referral Link",
    description: "If you have a referral link, it will be auto-filled. Otherwise, register directly.",
    url: "#referral"
  },
  {
    imageSrc: step4,
    title: "Check Email",
    description: "After registration, check your email for confirmation and your unique referral link.",
    url: "#email"
  },
  {
    imageSrc: step5,
    title: "Verify Ticket",
    description: "Enter your Ticket ID to join the referral programme and unlock sharing options.",
    url: "#ticket"
  },
  {
    imageSrc: step6,
    title: "Share & Track",
    description: "Share your referral link with friends and track your referrals on the leaderboard!",
    url: "#share"
  },
];

export default function RegistrationSteps() {
  return (
    <ThreeColSimple
      cards={cards}
      heading="How to Register for BGM Referral"
      subheading="Step-by-Step Guide"
      description="Follow these simple steps to join the BGM Referral Programme and start sharing your unique link!"
      linkText=""
    />
  );
}
