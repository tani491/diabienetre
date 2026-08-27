"use client";

import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Quels types de produits proposez-vous ?",
    answer:
      "Nous proposons des cosmétiques naturels et des soins capillaires à base de plantes (moringa, fenugrec...) pour des cheveux forts, une peau saine et un bien-être durable.",
  },
  {
    question: "Vos produits sont-ils 100% naturels ?",
    answer:
      "Oui, tous nos produits de beauté et de soins sont naturels pour respecter votre peau et vos cheveux.",
  },
  {
    question: "Où êtes-vous situés ?",
    answer: "Nous sommes situés sur la Route de Malika, à Dakar, Sénégal.",
  },
  {
    question: "Quels sont vos horaires d'ouverture ?",
    answer: "Notre boutique en ligne est ouverte 24h/24 pour prendre vos commandes.",
  },
  {
    question: "Comment vous contacter en cas de besoin ?",
    answer: "Vous pouvez nous joindre via WhatsApp ou par email à gakoudiarra840@gmail.com.",
  },
];

export default function FAQSection() {
  return (
    <section className="bg-sage-50/60 py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
            <HelpCircle className="h-4 w-4" />
            Foire aux questions
          </div>
          <h2 className="text-3xl font-bold text-sage-800 sm:text-4xl">
            Questions fréquentes
          </h2>
        </div>

        <div className="rounded-2xl border border-sage-100 bg-white px-5 shadow-sm sm:px-7">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`faq-${index}`}>
                <AccordionTrigger className="text-base font-semibold text-sage-800 hover:text-sage-600 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-7 text-sage-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
