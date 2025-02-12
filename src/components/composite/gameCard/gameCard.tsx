import React from "react";
import { memo } from "react";
import { motion, useSpring } from "framer-motion";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { DuelMasters } from "./gameCard.utils";

const cardBackImageSource =
  "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg";

const cardFrontImageSource = "https://images.pokemontcg.io/sm115/7_hires.png";

// const CardBackImage = React.forwardRef(() => {
//   return <img src={cardBackImageSource} />;
// });

// const CardFrontImage = React.forwardRef(() => {
//   return <img src={cardFrontImageSource} />;
// });

// const CardButton = React.forwardRef<unknown, React.PropsWithChildren>(
//   (props) => {
//     return (
//       <button className="appearance-none border-none bg-transparent p-0">
//         {props.children}
//       </button>
//     );
//   },
// );

// export const GameCard: React.FC = memo(() => {
//   return (
//     <div>
//       <div>
//         <CardButton>
//           <CardBackImage />
//           <div>
//             <CardFrontImage />
//           </div>
//         </CardButton>
//       </div>
//     </div>
//   );
// });

export const GameCard = ({}) => {
  const [active, setActive] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [loading, setLoading] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);

  // Framer Motion Springs (Replaces Svelte's Spring)
  const springRotate = useSpring(0, { stiffness: 50, damping: 10 });
  const springGlare = useSpring(50, { stiffness: 50, damping: 10 });
  const springScale = useSpring(1, { stiffness: 50, damping: 10 });

  const springRotateX = useSpring(0, { stiffness: 50, damping: 10 });
  const springRotateY = useSpring(0, { stiffness: 50, damping: 10 });

  const springGlareX = useSpring(50, { stiffness: 50, damping: 10 });
  const springGlareY = useSpring(50, { stiffness: 50, damping: 10 });

  const handleInteract = (e: any) => {
    setInteracting(true);

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = (e.clientX - rect.left - rect.width / 2) / 10;
      const centerY = (e.clientY - rect.top - rect.height / 2) / 10;

      // Apply rotation dynamically
      springRotateX.set(centerY);
      springRotateY.set(centerX);

      // Apply rotation dynamically
      springRotateX.set(centerY);
      springRotateY.set(centerX);
    }
  };

  const handleInteractEnd = () => {
    setTimeout(() => {
      setInteracting(false);

      // Set individual values
      springRotateX.set(0);
      springRotateY.set(0);

      springGlareX.set(50);
      springGlareY.set(50);
    }, 500);
  };

  const handleActivate = () => {
    setActive(!active);
  };

  return (
    <motion.div
      className="relative h-96 w-64 overflow-hidden rounded-xl border border-gray-600 bg-gray-900 shadow-xl"
      // data-number={number}
      // data-set={set}
      // data-subtypes={subtypes}
      // data-supertype={supertype}
      // data-rarity={rarity}
      style={{
        rotateX: springRotateX, // Apply Framer Motion spring
        rotateY: springRotateY,
        transition: "transform 0.1s ease-out",
        transform: `rotateX(${springRotateX}deg) rotateY(${springRotateY}deg) scale(${springScale})`,
      }}
    >
      <div className="relative flex items-center justify-center">
        <button
          className="relative block h-full w-full"
          onClick={handleActivate}
          onMouseMove={handleInteract}
          onMouseLeave={handleInteractEnd}
          aria-label={`Expand the Pokémon Card: ${name}`}
        >
          {/* Back Image */}
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={DuelMasters.back}
            alt="The back of a Pokémon Card"
            loading="lazy"
            width="660"
            height="921"
          />

          {/* Front Image */}
          <div className="absolute inset-0">
            <img
              src={DuelMasters.front}
              alt={`Front design of ${name} Pokémon Card`}
              onLoad={() => setLoading(false)}
              loading="lazy"
              width="660"
              height="921"
              className="h-full w-full object-cover"
            />
          </div>
        </button>
      </div>
    </motion.div>
  );
};

GameCard.displayName = "GameCard";
