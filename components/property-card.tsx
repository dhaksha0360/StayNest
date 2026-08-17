"use client";
import Image from "next/image";
import Link from "next/link";
import { BedDouble, Heart, MapPin, Star, Users } from "lucide-react";
import { api, imageUrl, money } from "@/lib/api";
import type { Property } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function PropertyCard({ property }: { property: Property }) {
  const [saved, setSaved] = useState(false);
  const favourite = async () => {
    if (!localStorage.getItem("staynest_token"))
      return toast.error("Sign in to save properties");
    try {
      if (saved) await api.delete(`/favourites/${property.id}`);
      else await api.post(`/favourites/${property.id}`);
      setSaved(!saved);
      toast.success(saved ? "Removed from favourites" : "Property saved");
    } catch {
      toast.error("Unable to update favourites");
    }
  };
  return (
    <article className="group min-w-0">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        <Link
          href={`/properties/${property.id}`}
          aria-label={`View stay: ${property.name}`}
        >
          <Image
            src={imageUrl(property.images?.[0]?.path)}
            alt={property.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
          />
        </Link>
        <button
          onClick={favourite}
          aria-label={saved ? "Remove saved property" : "Save property"}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm hover:scale-105"
        >
          <Heart
            size={18}
            className={saved ? "fill-rose-500 text-rose-500" : ""}
          />
        </button>
        {property.booking_type === "instant" && (
          <Badge className="absolute bottom-3 left-3 border-0 bg-white/95 text-slate-700 ring-0">
            Instant book
          </Badge>
        )}
      </div>
      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={13} />
              {property.city}, {property.country}
            </p>
            <Link
              href={`/properties/${property.id}`}
              className="mt-1 block truncate font-semibold tracking-tight hover:text-secondary-foreground"
            >
              {property.name}
            </Link>
          </div>
          <span className="mt-0.5 flex shrink-0 items-center gap-1 text-sm font-medium">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {Number(property.rating || 0).toFixed(1)}
          </span>
        </div>
        <p className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BedDouble size={14} />
            {property.bedrooms} bedrooms
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} />
            {property.max_guests} guests
          </span>
        </p>
        <p className="mt-2 text-sm">
          <strong className="font-semibold">
            {money(property.base_price)}
          </strong>
          <span className="text-muted-foreground"> night</span>
        </p>
      </div>
    </article>
  );
}
