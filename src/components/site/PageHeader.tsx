import { Reveal } from "./Reveal";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="relative overflow-hidden px-5 pt-36 pb-14 sm:px-8 md:pt-44 md:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-petal/50 blur-[120px]"
      />
      <div className="relative mx-auto w-full max-w-4xl text-center">
        <Reveal>
          <p className="eyebrow mb-5">{eyebrow}</p>
          <h1 className="text-4xl leading-[1.05] text-balance sm:text-5xl md:text-6xl">
            <span className="text-gradient-rose">{title}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        </Reveal>
      </div>
    </header>
  );
}
