"use client";

import { schABI, schAddress } from "@/utils/schoolContract";
import { CheckIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { title } from "process";
import { useEffect, useState } from "react";
import {
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";

export default function CoursesPage() {
  const //
    [courseTitle, setCourseTitle] = useState(""),
    [capacity, setCapacity] = useState(0),
    [description, setDescription] = useState(""),
    [loading, setLoading] = useState(""),
    //
    [_title, _setTitle] = useState<string[]>([]),
    [_lecturer, _setLecturer] = useState<string[]>([]),
    [_capacity, _setCapacity] = useState<bigint[]>([]),
    [_enrolledStudents, _setEnrolledStudents] = useState<bigint[]>([]),
    [_description, _setDescription] = useState<string[]>([]),
    //
    { writeContractAsync, status } = useWriteContract(),
    { refresh } = useRouter();

  let registeredCourses = useReadContract({
    abi: schABI,
    address: schAddress,
    functionName: "getAllCourses",
    // @ts-ignore
    args: [],
  });
  //

  useWatchContractEvent({
    address: schAddress,
    abi: schABI,
    eventName: "CourseCreated",
    onLogs(logs) {
      console.log("New logs!", logs);
    },
  });

  useEffect(() => {
    const data = registeredCourses.data;
    //
    _setTitle(data?.[0] as string[]);
    _setLecturer(data?.[1] as string[]);
    _setCapacity(data?.[2] as bigint[]);
    _setEnrolledStudents(data?.[3] as bigint[]);
    _setDescription(data?.[4] as string[]);
    //
  }, [registeredCourses]);

  useEffect(() => {
    if (status == "success") {
      setTimeout(() => {
        refresh();
      }, 2000);
    }
  }, [status]);
  return (
    <main className="w-3/4 flex self-center flex-col items-center justify-center gap-4 p-4 lg:gap-6 lg:p-6 ">
      <div className="flex flex-wrap flex-col justify-center">
        <div className="w-fit ">
          create courses
          <form className="flex flex-col">
            <div>
              <input
                className="m-1 p-2 bg-gray-200 rounded-lg"
                type="text"
                placeholder="Course Title"
                onChange={(event) => {
                  setCourseTitle(event.target.value);
                }}
              />
              <input
                className="m-1 p-2 bg-gray-200 rounded-lg"
                type="number"
                placeholder="Max. No. of Students"
                onChange={(event) => {
                  setCapacity(Number(event.target.value));
                }}
              />
            </div>
            <textarea
              cols={45}
              rows={5}
              className="m-1 p-2 bg-gray-200 rounded-lg"
              placeholder="Description"
              onChange={(event) => {
                setDescription(event.target.value);
              }}
            />
          </form>
          <button
            className="active:bg-gray-600 w-full bg-gray-500 p-2 m-1 rounded-lg text-white"
            onClick={() => {
              writeContractAsync({
                abi: schABI,
                address: schAddress,
                functionName: "createCourse",
                args: [courseTitle, BigInt(capacity), description],
              });
            }}
          >
            {status === "pending" || status === "success" ? status : "Create course"}
          </button>
        </div>
        <div>
          Existing Courses
          <div className="flex flex-wrap justify-center  ">
            {_title !== undefined
              ? _title.map((title, index) => {
                return (
                  <div
                    key={index}
                    className={` cursor-pointer relative md:w-fit p-4 text-center border-4 shadow-md shadow-gray-400 m-4 hover:*:text-black  transition-all bg-gray-200 *:text-gray-600 rounded-lg `}
                  //
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
        </div>
      </div>
    </main>
  );
}
