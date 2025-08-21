"use client";
import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Sign Up",
    desc: "Create your account in seconds and access your dashboard instantly.",
  },
  {
    number: "2",
    title: "Set Up",
    desc: "Customize your workspace and connect the tools you already use.",
  },
  {
    number: "3",
    title: "Start Growing",
    desc: "Use our platform to manage, automate, and grow your business.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-gray-900"
        >
          How It Works
        </motion.h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Get started in just a few simple steps and unlock the power of our platform.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-lg transition"
            >
              <div className="text-blue-600 text-4xl font-extrabold mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {step.title}
              </h3>
              <p className="mt-2 text-gray-600 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
