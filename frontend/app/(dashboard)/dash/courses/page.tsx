"use client";

import { Course } from "@/lib/types";
import RegisteredCoursesCard from "./_components/registered-course-card";
import Link from "next/link";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { schABI, schAddress } from "@/utils/schoolContract";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";

export default function ChatUi() {
  const //
    //
    [_title, _setTitle] = useState<string[]>([]),
    [_status, _setStatus] = useState(""),
    [_lecturer, _setLecturer] = useState<string[]>([]),
    [_capacity, _setCapacity] = useState<bigint[]>([]),
    [_enrolledStudents, _setEnrolledStudents] = useState<bigint[]>([]),
    [_description, _setDescription] = useState<string[]>([]),
    [loading, setLoading] = useState(""),
    //
    //
    { address } = useAccount(),
    { writeContractAsync, status, failureReason } = useWriteContract(),
    registeredCourses = useReadContract({
      abi: schABI,
      address: schAddress,
      functionName: "getCoursesRegisteredByStudent",
      args: [address as `0x${string}`],
    }),
    availableCourses = useReadContract({
      abi: schABI,
      address: schAddress,
      functionName: "getAllCourses",
      // @ts-ignore
      args: [],
    }),
    _loading = (target: any) => {
      const //

        loading = document.createElement("div");
      loading.style.height = "100%";
      loading.style.width = "100%";
      loading.style.position = "absolute";
      loading.style.top = "0";
      loading.style.left = "0";
      loading.style.opacity = "0.5";
      loading.style.alignContent = "center";
      loading.style.backgroundColor = "green";

      loading.innerHTML = `<img src="/loading.gif" alt="loading" width="100" height="100"></img>`;

      target.appendChild(loading);
      console.log(target);
    },
    { refresh } = useRouter();

  useEffect(() => {
    setTimeout(() => {
      status == "success" ? refresh() : null;
    }, 2500);
  }, [status]);

  useEffect(() => {
    const data = availableCourses.data;
    //
    _setTitle(data?.[0] as string[]);
    _setLecturer(data?.[1] as string[]);
    _setCapacity(data?.[2] as bigint[]);
    _setEnrolledStudents(data?.[3] as bigint[]);

    _setDescription(data?.[4] as string[]);
    //
  }, [availableCourses]);

  useEffect(() => {
    failureReason !== null ? alert(failureReason?.cause) : null;
  }, [failureReason]);

  useEffect(() => {
    _setStatus(status);
  }, [status]);

  return (
    <main className="flex justify-center items-center gap-4 p-4 md:gap-8 md:p-6">
      <div className="w-3/4 ">
        <section className="bg-gray-50 p-2">
          <h1>Courses you have registered</h1>
          <div className="flex flex-wrap ">
            {registeredCourses.data?.map((course) => {
              return (
                <div
                  className="px-4 m-2 bg-gray-200 rounded-sm h-24 flex items-center shadow-md hover:shadow-sm cursor-grabbing"
                  key={Number(course)}
                >
                  {_title !== undefined ? _title[Number(course) - 1] : null}
                </div>
              );
            })}
          </div>
        </section>
        <br />
        <section className="bg-gray-50 p-2">
          <h1>Available Courses</h1>

          <div className=" flex flex-wrap justify-center  ">
            {_title !== undefined
              ? _title.map((title, index) => {
                  return (
                    <div
                      key={index}
                      className={` cursor-pointer relative md:w-fit p-4 text-center border-4 shadow-md active:shadow-sm shadow-gray-400 m-4 hover:*:text-black  transition-all bg-gray-200 *:text-gray-600 rounded-lg `}
                      //
                      onClick={(event) => {
                        writeContractAsync({
                          abi: schABI,
                          address: schAddress,
                          functionName: "registerForCourse",
                          args: [_title[index]],
                        });
                        setLoading(title);
                      }}
                    >
                      <div
                        className={
                          (status == "pending"
                            ? loading == title
                              ? "visible"
                              : "hidden"
                            : "hidden") +
                          " absolute flex justify-center items-center top-0 left-0 h-full w-full backdrop-blur-sm"
                        }
                      >
                        <Image
                          src={"/loading.gif"}
                          alt={"loading"}
                          width={70}
                          height={70}
                        ></Image>
                      </div>
                      <div>
                        <div className="text-2xl flex justify-center items-end">
                          {" "}
                          <b>{title}</b>
                          {title ==
                          _title[
                            Number(registeredCourses.data?.[index])
                          ] ? null : (
                            <span className="text-xs text-green-700">
                              <CheckIcon />
                            </span>
                          )}
                        </div>

                        <div className="text-justify p-3 m-2 bg-gray-300 rounded-sm w-96">
                          {_description[index]}
                        </div>
                        <div className="*:bg-gray-300 *:m-2 *:p-1 *:rounded-sm *:w-96">
                          <div className="">
                            Lecturer:{" "}
                            {_lecturer[index].replace(
                              _lecturer[index].slice(
                                4,
                                _lecturer[index].length - 4
                              ),
                              "..."
                            )}
                          </div>
                          <div>
                            Capacity: {Number(_capacity[index])} students
                          </div>
                          <div>
                            Enrolled Students:{" "}
                            {Number(_enrolledStudents[index])} students
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
        </section>
      </div>
    </main>
  );
}
