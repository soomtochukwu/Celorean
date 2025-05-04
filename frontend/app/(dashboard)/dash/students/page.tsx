"use client";

import { schABI, schAddress } from "@/utils/schoolContract";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { bigint } from "zod";

const Students = () => {
  const //
    { address } = useAccount(),
    result = useReadContract({
      abi: schABI,
      address: schAddress,
      functionName: "getListOfStudents",
      args: [],
    }),
    router = useRouter();
  //
  return (
    <main className="gap-4 p-4 lg:gap-6 lg:p-6  flex-col justify-center">
      <div>
        <span>Meet and network with your fellow students(s)</span>
        <div className="flex flex-wrap">
          {result.data?.map((student) => {
            return (
              <div
                key={student.slice(0, 10)}
                className="bg-gray-300 rounded-lg m-3 p-2 flex flex-col"
              >
                <Link
                  target={student}
                  className="p-3 bg-gray-200 rounded-lg active:bg-gray-300"
                  key={student.slice(2, 6)}
                  href={`https://celo-alfajores.blockscout.com/address/${student}`}
                >
                  {student.replace(student.slice(5, student.length - 4), "...")}
                </Link>
                <div className="text-gray-500">stats:</div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Students;
