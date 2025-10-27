export default function Home() {
  type ProjectDetails = {
    name: string,
    uri: string,
    description: string
  }

  const projects: Array<ProjectDetails> = [{
    name: "Tank Game",
    uri: "https://ihtnc.github.io/canvas-concoctions/concoctions/tank-game?no-nav&no-title&no-padding",
    description: "A tank game made with the help of GitHub Copilot."
  },{
    name: "use-animated-canvas",
    uri: "https://www.npmjs.com/package/@ihtnc/use-animated-canvas",
    description: "A React hook to create a canvas element with a built-in render loop."
  },{
    name: "advent-of-code-js",
    uri: "https://advent-of-code-js.vercel.app/",
    description: "A collection of JavaScript solutions for the Advent of Code challenges."
  }, {
    name: "Dooduel",
    uri: "https://dooduel.vercel.app/",
    description: "A multiplayer drawing and guessing game."
  }]

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="mb-3 text-2xl font-semibold">
          /ihtnc
        </h1>
      </div>

      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
        A collection of projects I have been working on that I find interesting.
        </p>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        {projects.map((project, index) => (
          <a key={index}
            href={project.uri}
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              {`${project.name} `}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              {project.description}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
