// components/Footer.js
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 px-8">
      <div className="max-w-4xl mx-auto">
        <p className="text-center">
          &copy; 2024 EduChain dApp by Team-Cyberhack of{" "}
          <Link href={"https://blockchainunn.org/"} target="BlockchainUNN">
            <b>BlockchainUNN</b>
          </Link>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
