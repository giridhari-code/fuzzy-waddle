import { CheckCircle, BarChart, Zap, Users } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
      title: "Easy to Use",
      desc: "Designed with simplicity in mind so you can get started instantly without a steep learning curve.",
    },
    {
      icon: <BarChart className="w-6 h-6 text-blue-600" />,
      title: "Advanced Analytics",
      desc: "Gain deep insights with real-time reports and detailed analytics dashboards.",
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: "Lightning Fast",
      desc: "Optimized for performance so your team can work without slowdowns.",
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Collaboration Ready",
      desc: "Invite team members and collaborate in real-time from anywhere.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Powerful Features
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to grow your business, in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex gap-4 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex-shrink-0">{feature.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-1 text-gray-600 text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
