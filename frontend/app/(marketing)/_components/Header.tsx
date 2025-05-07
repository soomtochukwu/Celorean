import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "lucide-react";
import Image from "next/image";
import React from "react";

const Header = () => {
  return (
    <div className="flex sticky z-50 top-0 justify-center bg-gray-300">
      <header className="px-4 lg:px-6 h-16 w-full lg:py-9 flex items-center">
        <a href="/" className="flex items-center  gap-2">
          <Image
            alt="Cuber Edu. Logo"
            width={40}
            height={40}
            src={"/logo.jpeg"}
          />
          <span className="font-bold text-2xl text-black">Celorean</span>
        </a>
        <div className="text-sm font-medium ml-auto">
          <ConnectButton label="Sign up or Sign in" />
        </div>
      </header>
    </div>
  );
};

export default Header;
