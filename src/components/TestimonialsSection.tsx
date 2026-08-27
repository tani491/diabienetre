"use client";

import { useEffect, useState } from "react";
import { MessageSquareQuote, Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating: number;
  createdAt: string;
}

function clampRating(rating: number) {
  return Math.min(Math.max(Number(rating) || 0, 0), 5);
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/testimonials", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setTestimonials(Array.isArray(data) ? data : []);
      })
      .catch(() => setTestimonials([]));
  }, []);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-sage-100 px-4 py-2 text-sm font-medium text-sage-700 mb-4">
            <MessageSquareQuote className="w-4 h-4" />
            Avis clients
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-sage-800">
            Ce que disent nos clientes
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => {
            const rating = clampRating(testimonial.rating);

            return (
              <article
                key={testimonial.id}
                className="rounded-2xl border border-sage-100 bg-sage-50/50 p-6 shadow-sm"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`w-4 h-4 ${
                        index < rating ? "text-gold fill-gold" : "text-sage-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm leading-7 text-sage-600 mb-5">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <p className="font-semibold text-sage-800">{testimonial.name}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
