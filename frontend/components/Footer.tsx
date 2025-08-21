export default function Footer() {
  return (
    <><section className="bg-blue-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Ready to supercharge your business?
        </h2>
        <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
          Get started today and see how our platform can transform your workflow.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="#signup"
            className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-50 transition"
          >
            Get Started
          </a>
          <a
            href="#contact"
            className="border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
    <footer className="bg-gray-900 text-gray-400 py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-white font-bold text-lg">KaloOne Corporation</h3>
          <p className="mt-3 text-sm">
            Making businesses simpler, faster, and smarter through technology.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <ul className="space-y-2">
            <li><a href="#about" className="hover:text-white">About Us</a></li>
            <li><a href="#careers" className="hover:text-white">Careers</a></li>
            <li><a href="#blog" className="hover:text-white">Blog</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-white font-semibold mb-3">Resources</h4>
          <ul className="space-y-2">
            <li><a href="#help" className="hover:text-white">Help Center</a></li>
            <li><a href="#guides" className="hover:text-white">Guides</a></li>
            <li><a href="#docs" className="hover:text-white">Documentation</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <p>Email: <a href="mailto:info@kaloone.com" className="hover:text-white">info@kaloone.com</a></p>
          <p>Phone: +91 98765 43210</p>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} KaloOne Corporation. All rights reserved.
      </div>
    </footer>
    </>
  );
}
