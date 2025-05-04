import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import React from "react";

const Header = () => {
  return (
    <div className="flex sticky z-50 top-0 justify-center bg-gray-300">
      <header className="px-4 lg:px-6 h-16 w-full lg:py-9 flex items-center">
        <div className="flex items-center  gap-2">
          <Image
            alt="Cuber Edu. Logo"
            width={50}
            height={50}
            src={"/logo.jpeg"}
          />
          <span className="font-bold text-black">EduChain</span>
        </div>
        <div className="text-sm font-medium ml-auto">
          <ConnectButton label="Sign up or Sign in" />
        </div>
      </header>
    </div>
  );
};

export default Header;
