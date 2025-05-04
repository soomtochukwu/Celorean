import React from "react";
import { paths } from "./_components/sidebar";
import Link from "next/link";

const Dashboard = () => {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <b>Dashboard</b>
      <div className="bg-green-200 rounded-2xl h-52 w-full flex justify-center items-center">
        Competitions and Prices
      </div>
      <div className=" flex flex-wrap justify-center">
        {paths.map((path) => {
          return (
            <div
              key={path.name}
              className="active:shadow-gray-200 p-2 m-2 bg-gray-200 rounded-lg lg:w-1/3 h-56 md:w-4/5 w-5/6 shadow-md shadow-gray-400"
            >
              <Link
                href={path.href}
                className="flex items-center justify-center w-full h-full"
              >
                {path.name}
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default Dashboard;
