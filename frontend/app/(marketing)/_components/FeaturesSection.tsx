// components/FeaturesSection.js
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeaturesSection = () => {
  return (
    <div className="py-20 px-8 ">
      <div className="mx-auto  lg:w-4/5 w-full ">
        <h2 className="text-3xl font-semibold mb-12 text-center">
          Key Features
        </h2>
        <div className="flex flex-wrap justify-center gap-12">
          <FeatureCard
            icon="📚"
            title="Personalized Learning Paths"
            description="AI analyzes student performance data (stored securely on
                      the blockchain) to identify strengths, weaknesses, and
                      learning styles. Based on this analysis, the system
                      recommends personalized learning paths with curated
                      content tailored to individual needs."
          />
          <FeatureCard
            icon="💼"
            title="Interactive Learning Modules"
            description="The platform offers interactive learning modules that
                      leverage gamification elements to boost engagement.
                      Modules may include quizzes, interactive exercises, and
                      simulations that provide immediate feedback and track
                      progress."
          />
          <FeatureCard
            icon="💡"
            title="Checkpoints and Attendance"
            description="The system incorporates checkpoints at strategic points
                      within the learning path. Students must successfully
                      complete checkpoints to progress further, ensuring mastery
                      of key concepts. Attendance is recorded using a secure
                      verification method (e.g., facial recognition, unique
                      access codes)."
          />
          <FeatureCard
            icon="🖩"
            title="Performance Calculation and Rewards"
            description="An AI-powered engine calculates student performance and rewards them with Real-world benefits (optional) like redeemable points
                        for discounts or educational resources. based
                      on various factors: Time spent on learning activities, Scores on quizzes and assessments, Completion of modules and checkpoints, etc,."
          />
        </div>

        <section className="benefits mb-16 bg-white p-6 rounded-lg shadow-md mt-10 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Benefits</h2>
          <ul className="list-disc ml-4">
            <li className="text-gray-600">
              Personalized Learning: Cater to individual student needs and
              learning styles.
            </li>
            <li className="text-gray-600">
              Improved Engagement: Gamification elements and interactive modules
              boost motivation.
            </li>
            <li className="text-gray-600">
              Secure and Transparent Data: Blockchain ensures tamper-proof
              records and data security.
            </li>
            <li className="text-gray-600">
              Measurable Progress: Track performance with clear checkpoints and
              progress reports.
            </li>
            <li className="text-gray-600">
              Reward-Driven Learning: Motivate students with a rewarding system
              that recognizes achievements.
            </li>
          </ul>
        </section>
        <div>
          <div className="flex justify-center">
            <ConnectButton label="Get Started"></ConnectButton>
          </div>
          <div className="flex justify-center text-gray-500">
            Sign up or Sign in
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white md:w-72 w-full p-6 rounded-lg shadow-md flex flex-col items-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-justify">{description}</p>
    </div>
  );
};

export default FeaturesSection;
