"use client";

import { schABI, schAddress } from "@/utils/schoolContract";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { bigint } from "zod";

const Teachers = () => {
  const //
    [studentAddress, setStudentAddress] = useState(""),
    [amountOfTokens, setAmountOfTokens] = useState(0),
    //
    { address } = useAccount(),
    { writeContractAsync, status, failureReason } = useWriteContract(),
    result = useReadContract({
      abi: schABI,
      address: schAddress,
      functionName: "getSessionIdsForLecturer",
      args: [],
    }),
    router = useRouter();
  //
  useEffect(() => {
    failureReason !== null
      ? alert(
        failureReason?.cause !== undefined
          ? failureReason?.cause
          : "Input fields cannot be empty"
      )
      : null;
  }, [failureReason]);
  useEffect(() => {
    status == "success"
      ? setTimeout(() => {
        router.refresh();
      }, 2000)
      : null;
  }, [status]);
  useEffect(() => {
    console.log("result.data", result.data);
  }, [result]);
  //
  return (
    <main className="gap-4 p-4 lg:gap-6 lg:p-6  flex-col justify-center">
      Admit Student
      <div className="lg:w-1/2 flex">
        <form className="flex w-fit">
          <div className=" flex flex-col *:w-96 *:p-4">
            <input
              className="m-1 p-2 bg-gray-200 rounded-lg"
              type="text"
              placeholder="Lecturer's Address"
              onChange={(event) => {
                setStudentAddress(event.target.value);
              }}
            />
            <input
              className="m-1 p-2 bg-gray-200 rounded-lg"
              type="number"
              placeholder="Amount of Token"
              onChange={(event) => {
                setAmountOfTokens(Number(event.target.value));
              }}
            />
          </div>
        </form>
        <button
          className="active:bg-gray-600 w-full bg-gray-500 p-2 m-1 rounded-lg text-white"
          onClick={() => {
            writeContractAsync({
              abi: schABI,
              address: schAddress,
              functionName: "employ_Lecturer",
              args: [studentAddress as `0x${string}`, BigInt(amountOfTokens)],
            });
          }}
        >
          {status === "pending" || "success" ? status : "Employ lecturer"}
        </button>
      </div>
      <div>
        <span>Employed lecturer(s)</span>
        <div className="flex flex-wrap">
          {result.data?.map((student) => {
            return (
              <div
                key={""}
                className="bg-gray-300 rounded-lg m-3 p-2 flex flex-col"
              ></div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Teachers;
