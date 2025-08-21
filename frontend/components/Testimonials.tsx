// components/Testimonials.tsx
"use client";

import { motion } from "framer-motion";


const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "CEO, Bharat Logistics",
    feedback:
      "This platform has transformed how we manage our supply chain. It's fast, reliable, and very easy to use.",

  },
  {
    name: "Anita Verma",
    role: "Founder, FreshKart",
    feedback:
      "The analytics and automation features saved us countless hours every month. Highly recommended!",

  },
  {
    name: "Mohammed Iqbal",
    role: "Operations Head, SpeedCargo",
    feedback:
      "From inventory to delivery tracking, everything is streamlined. Great work by the team!",

  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-gray-900"
        >
          Trusted by Businesses Across India
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-lg text-gray-600"
        >
          See what our clients have to say about us.
        </motion.p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white shadow-lg rounded-2xl p-6"
            >

              <h3 className="mt-4 text-xl font-semibold text-gray-800">{t.name}</h3>
              <p className="text-sm text-gray-500">{t.role}</p>
              <p className="mt-4 text-gray-600 italic">“{t.feedback}”</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
