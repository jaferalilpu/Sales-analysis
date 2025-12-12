import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  // Commented out footer links - pages still exist but not shown in footer
  // const footerLinks = {
  //   contact: [
  //     { name: 'Contact Us', href: '/contact' },
  //     { name: 'Support', href: '/support' },
  //   ],
  //   legal: [
  //     { name: 'Privacy Policy', href: '/privacy' },
  //     { name: 'Terms of Service', href: '/terms' },
  //   ],
  // };

  return (
    <footer className="bg-black text-white hidden md:block">
      <div className="container-custom">
        {/* Main footer content - commented out */}
        {/* <div className="py-12 md:py-16">
          <div className="flex justify-between items-start w-full gap-4">
            <div className="space-y-3 flex-1 text-center">
              <h3 className="text-lg font-bold">
                Drops
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/drops" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Upcoming Drops
                  </a>
                </li>
                <li>
                  <a href="/archive" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Archive Drops
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3 flex-1 text-center">
              <h3 className="text-lg font-bold">
                Contact
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm" >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/support" className="text-gray-300 hover:text-white transition-colors text-sm" >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3 flex-1 text-center">
              <h3 className="text-lg font-bold" >
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/privacy" className="text-gray-300 hover:text-white transition-colors text-sm" >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-300 hover:text-white transition-colors text-sm" >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div> */}

        {/* Copyright and Payment Icons section */}
        <div className="border-t border-gray-800 py-10">
          <div className="flex flex-row items-center justify-between">
            {/* Payment Icons */}
            <div className="flex items-center justify-center gap-6">
              {/* Razorpay Full Logo - External SVG */}
              <div className="w-28 h-8 flex items-center justify-center">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
                  alt="Razorpay"
                  className="h-full w-auto opacity-60 grayscale"
                />
        </div>

              {/* PhonePe Full Logo - External SVG */}
              <div className="w-28 h-8 flex items-center justify-center">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg"
                  alt="PhonePe"
                  className="h-full w-auto opacity-60 grayscale"
                />
              </div>
            </div>

            {/* Copyright */}
            <div className="text-gray-300 text-base">
              © {currentYear} ULICA. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}