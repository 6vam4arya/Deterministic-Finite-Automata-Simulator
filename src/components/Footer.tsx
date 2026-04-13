import { Github, Linkedin, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row">
        
        {/* Left Text */}
        <p className="text-lg text-white/90 text-center md:text-left leading-relaxed max-w-md">
          Built with <span className="italic">passion</span> by{" "}
          <span className="font-semibold text-white underline">
            Vamika Arya
          </span>
          <br className="hidden sm:block" />
          <span className="italic text-white/80">
            Turning <span className="font-medium italic">automata</span> into experience
          </span>
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          
          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/vamika-arya-4a0179288/"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105"
          >
            <Linkedin className="h-4 w-4 text-white group-hover:text-blue-300 transition-colors" />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/6vam4arya"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
          >
            <Github className="h-4 w-4 text-white group-hover:text-purple-300 transition-colors" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          {/* Portfolio */}
          <a
            href="https://my-website-portfolio-mauve.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:shadow-lg hover:shadow-pink-500/30 hover:scale-105"
          >
            <ExternalLink className="h-4 w-4 text-white group-hover:text-pink-200 transition-transform group-hover:translate-x-1" />
            <span className="hidden sm:inline">Portfolio</span>
          </a>
        </div>
      </div>

      {/* Bottom line */}
      <div className="mt-6 text-center text-sm text-white/70">
        <span className="underline italic font-bold text-lg" >Built for learners</span>,{" "}
        <span className="font-medium font-bold text-lg underline">by a learner</span>
      </div>
    </footer>
  );
};

export default Footer;