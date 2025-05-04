import Gutter from "@/components/gutter";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import React from "react";

function HeroSection() {
  return (
    <Gutter>
      <section className="min-h-svh flex bg-red-5000 w-full justify-between ">
        <article className="w-1/2 self-center">
          <div>
            Never stop{" "}
            <Image
              alt="learning"
              width={200}
              height={10}
              src="/images/learning-text.png"
              className="inline "
            />
            <br />
            Life <b>Never Stop</b>
            Teaching
          </div>
          <p>
            Every teaching and learning journey is unique Following We&apos;ll
            help guide your way.
          </p>
          <Button>
            Start Learning <ArrowLeftIcon />{" "}
          </Button>
        </article>
        <div className="w-2/3 relative border flex   ">
          <Image
            className="aspect-video object-contain object-center self-baseline"
            alt="Hero image"
            src={"/images/hero-image.svg"}
            fill
          />
        </div>
      </section>
    </Gutter>
  );
}

export default HeroSection;
