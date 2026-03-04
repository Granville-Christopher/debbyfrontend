import { Link } from "react-router-dom";

const footerLinks = {
  Product: ["Storefront", "CRM", "Billing", "Automations", "Analytics", "Integrations"],
  Company: ["About", "Blog", "Careers", "Press"],
  Legal: ["Privacy", "Terms", "Security"],
  Contact: ["Support", "Sales", "Partners"],
};

export default function Footer() {
  return (
    <footer
      id="footer"
      className="border-t border-slate-200/70 bg-slate-100/60 py-16 dark:border-slate-800 dark:bg-slate-900/40"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <a href="#top" className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Debby<span className="text-blue-600 dark:text-blue-400">.</span>
            </a>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              The all-in-one commerce platform for modern business teams.
            </p>
          </div>
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{group}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#top" className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 pt-8 text-center dark:border-slate-800 sm:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} Debby for Business. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
              Privacy
            </Link>
            <Link to="/terms" className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

