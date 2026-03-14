import React from "react";
import { Mail, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { HeroHeader } from "./hero-header";
import { LogoCloud } from "./logo-cloud";
import { Card, CardContent, CardHeader } from "@kaijudo/react-card";
import mieleImage from "@kaijudo/react-card-images/creatures/miele-vizier-of-lightning.png?url";
import fonchImage from "@kaijudo/react-card-images/creatures/fonch-the-oracle.png?url";
import larbaImage from "@kaijudo/react-card-images/creatures/larba-geer-the-immaculate.png?url";
import rimuelImage from "@kaijudo/react-card-images/creatures/rimuel-cloudbreaker-elemental.png?url";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export default function HeroSection() {
  return (
    <>
      <HeroHeader />

      <main className="overflow-hidden">
        <section>
          <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-32 lg:pt-48">
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <TextEffect
                preset="fade-in-blur"
                speedSegment={0.3}
                as="h1"
                className="text-balance text-5xl font-medium md:text-6xl"
              >
                Welcome to Kaijudo
              </TextEffect>
              <TextEffect
                per="line"
                preset="fade-in-blur"
                speedSegment={0.3}
                delay={0.5}
                as="p"
                className="mx-auto mt-6 max-w-2xl text-pretty text-lg"
              >
                The ultimate Duel Masters card game experience. Build decks,
                battle opponents, and master the art of strategic card combat.
              </TextEffect>

              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
                className="mt-12"
              >
                <form action="" className="mx-auto max-w-sm">
                  <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] items-center rounded-[calc(var(--radius)+0.5rem)] border pr-2 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
                    <Mail className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4" />

                    <input
                      placeholder="Your mail address"
                      className="h-12 w-full bg-transparent pl-12 focus:outline-none"
                      type="email"
                    />

                    <div className="md:pr-1.5 lg:pr-0">
                      <Button
                        aria-label="submit"
                        size="sm"
                        className="rounded-(--radius)"
                      >
                        <span className="hidden md:block">Get Started</span>
                        <SendHorizonal
                          className="relative mx-auto size-5 md:hidden"
                          strokeWidth={2}
                        />
                      </Button>
                    </div>
                  </div>
                </form>

                <div
                  aria-hidden
                  className="bg-radial from-primary/50 dark:from-primary/25 relative mx-auto mt-32 max-w-2xl to-transparent to-55% text-left"
                >
                  <div className="bg-background border-border/50 absolute inset-0 mx-auto w-80 -translate-x-3 -translate-y-12 rounded-[2rem] border p-2 [mask-image:linear-gradient(to_bottom,#000_50%,transparent_90%)] sm:-translate-x-6">
                    <div className="relative h-96 overflow-hidden rounded-[1.5rem] border p-2 pb-12 before:absolute before:inset-0 before:bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] before:opacity-50"></div>
                  </div>
                  <div className="relative mx-auto w-full max-w-4xl translate-x-4 sm:translate-x-8">
                    <CardFan />
                  </div>
                  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] mix-blend-overlay [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:opacity-5"></div>
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const CardFan = () => {
  const cards = [
    {
      image: mieleImage,
      alt: "Miele, Vizier of Lightning",
      name: "Miele",
      rotation: -12,
      zIndex: 1,
      variant: "holo" as const,
    },
    {
      image: fonchImage,
      alt: "Fonch the Oracle",
      name: "Fonch",
      rotation: -6,
      zIndex: 2,
      variant: "reverse-holo" as const,
    },
    {
      image: larbaImage,
      alt: "Larba Geer the Immaculate",
      name: "Larba Geer",
      rotation: 0,
      zIndex: 3,
      variant: "rainbow" as const,
    },
    {
      image: rimuelImage,
      alt: "Rimuel Cloudbreaker Elemental",
      name: "Rimuel",
      rotation: 6,
      zIndex: 4,
      variant: "holo" as const,
    },
  ];

  return (
    <div className="relative flex items-center justify-center h-[600px] w-full overflow-hidden">
      {cards.map((card, index) => (
        <div
          key={card.alt}
          className="absolute transition-all duration-500 hover:z-50 hover:scale-110"
          style={{
            transform: `rotate(${card.rotation}deg) translateX(${
              (index - cards.length / 2) * 80
            }px)`,
            zIndex: card.zIndex,
          }}
        >
          <Card
            imageSrc={card.image}
            imageAlt={card.alt}
            holographic={true}
            variant={card.variant}
            className="w-[240px] h-[336px] sm:w-[280px] sm:h-[392px]"
          >
            <CardHeader className="text-xs sm:text-sm">{card.name}</CardHeader>
            <CardContent className="text-xs">
              <p className="font-semibold mb-1">DUEL MASTERS</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};
