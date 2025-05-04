"use client";

import "./marketing.css";

import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import Header from "./_components/Header";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Delete() {
  const { status } = useAccount(),
    router = useRouter();
  useEffect(() => {
    status == "connected" ? router.push("/dash") : null;
  }, [status]);

  return (
    <div className="grid flex-col min-h-[100dvh] ">
      <Header />
      <div className="flex lg:w-full lg:justify-center">
        <section className="lg:w-3/5 py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 py-8">
            <header className="flex justify-between items-end mb-8 w-fit">
              <h1 className="text-3xl font-bold text-gray-800">
                EduChain{": "}
              </h1>
              <p className="text-xs text-gray-600 ">
                Personalized Learning with Blockchain and AI (MVP)
              </p>
            </header>

            <main>
              <section className="bg-gray-100 rounded-lg p-3 mb-16">
                <h2 className="text-4xl font-bold text-gray-800">
                  Revolutionizing Education
                </h2>
                <p className="text-xl text-gray-600 mt-4">
                  EduChain leverages the power of blockchain and AI to create a
                  dynamic, secure, and rewarding learning experience for all.
                </p>
                <div className="mt-8">
                  <Link
                    className=" bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg"
                    href={"#key"}
                  >
                    Learn More
                  </Link>
                </div>
              </section>

              <section className="features mb-16" id="key">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Key Features
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <li className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Personalized Learning Paths
                    </h3>
                    <p className="text-gray-600">
                      AI analyzes student performance data (stored securely on
                      the blockchain) to identify strengths, weaknesses, and
                      learning styles. Based on this analysis, the system
                      recommends personalized learning paths with curated
                      content tailored to individual needs.
                    </p>
                  </li>
                  <li className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Interactive Learning Modules
                    </h3>
                    <p className="text-gray-600">
                      The platform offers interactive learning modules that
                      leverage gamification elements to boost engagement.
                      Modules may include quizzes, interactive exercises, and
                      simulations that provide immediate feedback and track
                      progress.
                    </p>
                  </li>
                  <li className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Secure Blockchain Ledger
                    </h3>
                    <p className="text-gray-600">
                      Student performance data, including completed modules,
                      scores, and achievements, are stored immutably on a
                      blockchain ledger. This ensures data security,
                      transparency, and tamper-proof records.
                    </p>
                  </li>
                  <li className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Checkpoints and Attendance
                    </h3>
                    <p className="text-gray-600">
                      The system incorporates checkpoints at strategic points
                      within the learning path. Students must successfully
                      complete checkpoints to progress further, ensuring mastery
                      of key concepts. Attendance is recorded using a secure
                      verification method (e.g., facial recognition, unique
                      access codes).
                    </p>
                  </li>
                  <li className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Performance Calculation and Rewards
                    </h3>
                    <p className="text-gray-600">
                      An AI-powered engine calculates student performance based
                      on various factors:
                      <ul className="list-disc ml-4">
                        <li>Completion of modules and checkpoints</li>
                        <li>Scores on quizzes and assessments</li>
                        <li>Time spent on learning activities</li>
                      </ul>
                      Based on performance, students earn rewards and badges
                      stored on the blockchain wallet. These rewards can be:
                      <ul className="list-disc ml-4">
                        <li>
                          Virtual badges and points redeemable for in-platform
                          privileges.
                        </li>
                      </ul>
                      <li>
                        Real-world benefits (optional) like redeemable points
                        for discounts or educational resources.
                      </li>
                    </p>
                  </li>
                </ul>
              </section>

              <section className="tech-stack mb-16">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Key Technologies
                </h2>
                <ul className="flex flex-wrap gap-4">
                  <li className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    Solidity
                  </li>
                  <li className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    NextJS
                  </li>
                </ul>
                <h3 className="text-2xl font-bold text-gray-800 mt-8">
                  Additional tools
                </h3>
                <ul className="flex flex-wrap gap-4">
                  <li className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    Ethers
                  </li>
                  <li className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    Rainbow Kit
                  </li>
                  <li className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    Wagmi
                  </li>
                </ul>
              </section>

              <section className="benefits mb-16">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Benefits
                </h2>
                <ul className="list-disc ml-4">
                  <li className="text-gray-600">
                    Personalized Learning: Cater to individual student needs and
                    learning styles.
                  </li>
                  <li className="text-gray-600">
                    Improved Engagement: Gamification elements and interactive
                    modules boost motivation.
                  </li>
                  <li className="text-gray-600">
                    Secure and Transparent Data: Blockchain ensures tamper-proof
                    records and data security.
                  </li>
                  <li className="text-gray-600">
                    Measurable Progress: Track performance with clear
                    checkpoints and progress reports.
                  </li>
                  <li className="text-gray-600">
                    Reward-Driven Learning: Motivate students with a rewarding
                    system that recognizes achievements.
                  </li>
                </ul>
              </section>
            </main>
          </div>
        </section>
      </div>
      <footer className="flex flex-col gap-2 sm:flex-row py-2 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <nav className="flex flex-col gap-2 md:flex-row md:ml-auto md:gap-4 lg:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
        <p>&copy; Cuberhack 2024</p>
      </footer>
    </div>
  );
}
