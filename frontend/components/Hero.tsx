export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 text-center">

        {/* Title */}
        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Power Your Business <span className="text-blue-600">Smarter</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          KaloOne AI-powered platform helps MSMEs manage suppliers, track inventory,
          and automate workflows — faster, smarter, and easier.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="#"
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </a>
          <a
            href="#"
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Learn More
          </a>
        </div>

      </div>
    </section>
  );
}
