import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TextGenerate({
  words,
  className,
  delay = 0,
}: {
  words: string;
  className?: string;
  delay?: number;
}) {
  const parts = words.split(" ");

  return (
    <span className={cn(className)}>
      {parts.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: 0.2,
            delay: delay + i * 0.015,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mr-[0.28em] inline"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
