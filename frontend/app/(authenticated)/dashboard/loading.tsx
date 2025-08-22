"use client"
import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center w-full">
      <Image width={50} height={50} src={"/loading.gif"} alt={""}></Image>
    </div>
  );
}
