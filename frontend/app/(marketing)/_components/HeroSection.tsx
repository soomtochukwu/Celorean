// components/HeroSection.js
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import React from "react";

const HeroSection = () => {
  return (
    <div
      className="bg-cover flex flex-col justify-center items-center bg-center relative h-screen"
      style={{
        backgroundImage: "url('/hero_bg.png')",
        minHeight: "500px",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-85 z-0"></div>
      <div className="relative inset-0 flex items-center font-mono justify-center mx-6 p-6 md:py-60">
        <div className="absolute rounded-2xl inset-0 bg-gray-500 z-0 opacity-30"></div>
        <div className="max-w-4xl mx-auto z-10 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Welcome to Celorean
          </h1>
          <div>
            <h2 className="text-xl font-bold text-gray-400 text-justify">
              ...Revolutionizing Education Through Personalized Learning with
              Blockchain and AI (MVP).
            </h2>
            <p className="text-base text-gray-400 mt-4 text-justify">
              Celorean leverages the power of blockchain and AI to create a
              dynamic, secure, and rewarding learning experience for all.
            </p>
          </div>
          <button
            onClick={() => {
              // @ts-ignore
              document
                .getElementById("continueReading")
                .scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-white text-green-700 mt-6 font-semibold py-2 px-6 rounded-full right-5 md:absolute bottom-5 hover:bg-blue-100 transition duration-300"
          >
            Continue reading
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
