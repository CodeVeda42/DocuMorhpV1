import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface TextTypeProps {
  text: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  cursorCharacter?: string;
  className?: string;
  showCursor?: boolean;
}

const TextType = ({
  text,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  cursorCharacter = "|",
  className = "",
  showCursor = true,
}: TextTypeProps) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentString = text[currentIndex % text.length];

    // Determine the speed based on the current state
    let speed = typingSpeed;
    if (isDeleting) {
      speed = deletingSpeed;
    } else if (currentText === currentString) {
      speed = pauseDuration; // Pause at the end of the string
    } else if (isDeleting && currentText === "") {
      speed = typingSpeed; // Pause briefly before typing next
    }

    const handleType = () => {
      if (!isDeleting && currentText === currentString) {
        // Finished typing, start deleting after pause
        setIsDeleting(true);
      } else if (isDeleting && currentText === "") {
        // Finished deleting, move to next string
        setIsDeleting(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Typing or deleting characters
        const nextText = isDeleting
          ? currentString.substring(0, currentText.length - 1)
          : currentString.substring(0, currentText.length + 1);
        setCurrentText(nextText);
      }
    };

    timer = setTimeout(handleType, speed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentIndex, text, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={cn("inline-block", className)}>
      {currentText}
      {showCursor && (
        <span className="animate-pulse ml-1 font-light text-indigo-500">
          {cursorCharacter}
        </span>
      )}
    </span>
  );
};

export default TextType;
