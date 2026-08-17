"use client";
import Image from "next/image";
import { Images } from "lucide-react";
import type { Image as PropertyImage } from "@/types";
import { imageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export function PropertyGallery({
  images,
  name,
}: {
  images: PropertyImage[];
  name: string;
}) {
  const gallery = images.length
    ? images
    : [{ id: 0, path: "", is_cover: true }];
  return (
    <Dialog>
      <div className="relative flex snap-x gap-2 overflow-x-auto rounded-xl sm:grid sm:aspect-[2.15/1] sm:grid-cols-2 sm:overflow-hidden">
        <DialogTrigger asChild>
          <button className="relative aspect-[4/3] min-w-[88%] snap-center overflow-hidden sm:aspect-auto sm:min-w-0">
            <Image
              src={imageUrl(gallery[0]?.path)}
              alt={name}
              fill
              priority
              sizes="(max-width:640px) 90vw, 50vw"
              className="object-cover transition-transform duration-300 hover:scale-[1.02]"
            />
          </button>
        </DialogTrigger>
        <div className="hidden grid-cols-2 gap-2 sm:grid">
          {[1, 2, 3, 4].map((index) => (
            <DialogTrigger asChild key={index}>
              <button className="relative overflow-hidden">
                <Image
                  src={imageUrl(gallery[index]?.path ?? gallery[0]?.path)}
                  alt={`${name} view ${index + 1}`}
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </button>
            </DialogTrigger>
          ))}
        </div>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-3 right-3 bg-white/95"
          >
            <Images size={15} />
            View all photos
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogTitle>Photos of {name}</DialogTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {gallery.map((image, i) => (
            <div
              key={image.id || i}
              className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
            >
              <Image
                src={imageUrl(image.path)}
                alt={image.alt_text ?? `${name} photo ${i + 1}`}
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
