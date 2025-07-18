// import Head from "next/head";
import { motion } from "framer-motion";

export default function FounderPage() {
  return (
    <>
      {/* <Head>
        <title>Saas- AI Tool</title>
        <meta name="description" content="Hear directly from our founder about the mission behind our hotel management platform." />
      </Head> */}

      <main className="min-h- p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl w-full rounded-3xl overflow-hidden shadow-xl p-6 md:p-12 flex flex-col md:flex-row items-center gap-8"
        >
          {/* Founder Photo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <img
              src="owners.jpeg"  // replace with your founder image in /public
              alt="Founder"
              className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-blue-500 object-cover shadow-md"
            />
          </motion.div>

          {/* Text Section */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 text-transparent bg-clip-text font-primary">
              📝 Our Founder’s Vision
            </h1>
            <motion.blockquote
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="italic text-lg text-gray-700 dark:text-gray-300 border-l-4 border-indigo-500 pl-4 mb-4 font-secondary"
            >
              ““When I started this journey, my goal wasn’t just to build another tool — it was to create something that feels almost human in its ability to help
              <br /><br />
               I believe AI should empower everyone: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">making complex tasks simple, saving precious time, and sparking new ideas.</span>.
              <br /><br />
              This platform is built on that vision: to blend cutting-edge technology with real-world usability. <span className="font-semibold">My hope is that every user </span>.
              <br /><br />
               feels they’re not just using a tool, but collaborating with an intelligent partner that understands their needs.”
            </motion.blockquote>
            <div className="mt-4">
              <p className="font-semibold text-indigo-600 dark:text-indigo-400">— Nitish Kumar, Founder & FullStack + AI Developer</p>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
