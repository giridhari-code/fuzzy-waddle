import { motion } from 'framer-motion';

export default function PricingSection() {
  const plans = [
    {
      name: 'Basic',
      price: '$19/mo',
      features: ['Feature A', 'Feature B', 'Feature C'],
      popular: false,
    },
    {
      name: 'Pro',
      price: '$49/mo',
      features: ['Everything in Basic', 'Feature D', 'Feature E'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99/mo',
      features: ['Everything in Pro', 'Feature F', 'Feature G'],
      popular: false,
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Pricing Plans</h2>
          <p className="text-gray-600 mt-2">Choose the plan that works best for you</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              whileHover={{ scale: 1.05 }}
              key={index}
              className={`relative rounded-xl shadow-lg border p-6 bg-white transition ${
                plan.popular ? 'border-blue-500 ring-2 ring-blue-200' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
              <p className="text-3xl font-bold mb-6">{plan.price}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="text-gray-600 flex items-center gap-2">
                    ✅ {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
