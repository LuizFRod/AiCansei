import { StarRating } from "@/components/ui/StarRating";
import { formatDate } from "@/lib/utils";

interface ReviewCardProps {
  reviewer: {
    id: string;
    name: string;
    photo?: string | null;
  };
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export function ReviewCard({ reviewer, rating, comment, createdAt }: ReviewCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
          {reviewer.photo ? (
            <img
              src={reviewer.photo}
              alt={reviewer.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            reviewer.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <a
              href={`/usuario/${reviewer.id}`}
              className="text-sm font-semibold text-gray-900 hover:text-emerald-700"
            >
              {reviewer.name}
            </a>
            <span className="text-xs text-gray-400">{formatDate(createdAt)}</span>
          </div>
          <div className="mt-1">
            <StarRating value={rating} size="sm" />
          </div>
          {comment && (
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
