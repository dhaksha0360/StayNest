import Image from "next/image";
import { cn, imageUrl } from "@/lib/api";
export function Avatar({
  src,
  name,
  className,
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-secondary-foreground",
        className,
      )}
    >
      {src ? (
        <Image
          src={imageUrl(src)}
          alt={name}
          fill
          className="object-cover"
          sizes="48px"
        />
      ) : (
        name
          .split(" ")
          .map((x) => x[0])
          .slice(0, 2)
          .join("")
      )}
    </span>
  );
}
