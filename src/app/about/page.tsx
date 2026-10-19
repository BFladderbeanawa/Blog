import type { Metadata } from 'next';
import Image from 'next/image';
import antenna from '@/assets/about/satellite-antenna.svg';
import controller from '@/assets/about/video-game.svg';
import pick from '@/assets/about/pick.svg';
import illustration from '@/assets/illustration.png';
import geometry from '@/assets/ui/Group 150.svg';
import { RouteLink } from '@/components/site/Navigation';
import { AboutEntry } from './AboutEntry';
import { EasedDetails } from './EasedDetails';
import { SectionJump } from './SectionJump';

export const metadata: Metadata = {
  title: 'About',
  description:
    'BF, a little undefined. Machine learning, graphic design, an OC, and whatever else I feel like getting into.',
  alternates: { canonical: '/about' },
};

const inlineLink =
  'inline-block underline decoration-1 underline-offset-[5px] hover:text-violet hover:decoration-2';

export default function About() {
  return (
    <main
      id="main-content"
      className="room relative isolate mx-auto w-[min(100%,1440px)] overflow-clip px-[clamp(24px,5%,72px)] pt-20 pb-[120px] [&_figure]:min-w-0 [&_section>div]:min-w-0 [&_section]:min-w-0 max-sm:pt-12 max-xs:pt-8 max-xs:pb-[72px]"
      data-about-page
    >
      <AboutEntry />
      <svg
        className="thread pointer-events-none absolute inset-x-0 top-[60px] bottom-0 -z-[1] h-[calc(100%-60px)] w-full text-violet max-sm:opacity-35"
        viewBox="0 0 1280 2800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="[stroke-width:1.5] [vector-effect:non-scaling-stroke]"
          data-about-thread
          pathLength={1}
          d="M 30 350 C 180 100, 650 40, 1030 230 S 1230 700, 760 760 S 80 750, 130 1050 S 700 1400, 1020 1280 C 1340 1150, 1260 900, 1110 1060 S 910 1640, 570 1740 S -80 1770, 120 2050 S 1160 2020, 1090 2400 S 680 2640, 740 2800"
        />
      </svg>

      <section
        className="hello relative grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-start gap-6 pb-[104px] max-sm:grid-cols-1 max-sm:gap-[50px] max-sm:pb-[120px]"
        aria-labelledby="about-heading"
      >
        <div className="greeting relative z-[1] pt-[30px] [container-type:inline-size] max-sm:pt-0">
          <p
            className="name mb-7 inline-block bg-acid px-3 py-[3px] text-[21px] -rotate-[5deg]"
            data-about-reveal
          >
            Hi, I’m BF.
          </p>
          <h1
            className="font-scene text-[clamp(40px,12cqw,88px)] leading-[0.96] font-extrabold tracking-[-0.075em] max-sm:text-[clamp(36px,12cqw,88px)]"
            id="about-heading"
            data-about-reveal
          >
            A little
            <br />
            undefined.
          </h1>
          <div
            className="welcome mt-8 ml-[9%] max-w-[330px] text-[18px] leading-[1.7] [&_p+p]:mt-3 max-md:ml-0 max-md:text-[17px] max-sm:mt-7 max-sm:max-w-[380px]"
            data-about-reveal
          >
            <p>BFladderbean works too.</p>
            <p>
              I research machine learning. Outside of that? A bit of everything, honestly. This is
              my little corner of the internet. Make yourself at home.
            </p>
          </div>
          <div data-about-reveal>
            <SectionJump
              className="sideNote relative mt-11 ml-[15%] flex w-fit max-w-[235px] items-center gap-[18px] text-base text-violet -rotate-[4deg] hover:[&>span:first-child]:underline hover:[&>span:first-child]:underline-offset-4 focus-visible:[&>span:first-child]:underline focus-visible:[&>span:first-child]:underline-offset-4 max-sm:mt-7 max-sm:ml-[10%]"
              sectionId="off-the-clock"
            >
              <span>There’s more to life than the research bit.</span>
              <span className="text-4xl leading-none" aria-hidden="true">
                ↓
              </span>
            </SectionJump>
          </div>
          <Image
            src={geometry}
            alt=""
            width={220}
            height={220}
            className="geometry mt-6 ml-[38%] block h-auto w-[clamp(160px,30cqw,220px)] rotate-[12deg] brightness-0 pointer-events-none"
            data-about-reveal
          />
        </div>

        <figure className="oc relative m-0 pt-[18px] before:absolute before:top-[38px] before:-right-5 before:-z-[1] before:aspect-square before:w-[86%] before:rounded-full before:bg-violet before:content-[''] max-sm:w-[88%] max-sm:max-w-[440px] max-sm:justify-self-center max-sm:before:-right-3">
          <div
            className="ocFrame rotate-[4deg] bg-white [clip-path:polygon(8%_0,100%_0,100%_91%,88%_100%,0_100%,0_7%)]"
            data-about-reveal
          >
            <Image
              className="block h-auto w-full"
              src={illustration}
              alt="My original character, with white hair, pink eyes, cat ears, and a pink-and-violet outfit."
              sizes="(max-width: 760px) 88vw, (max-width: 1440px) 40vw, 560px"
              preload
            />
          </div>
          <figcaption
            className="relative mt-6 ml-[12%] w-3/4 text-[15px] leading-[1.65] max-sm:ml-[5%] max-sm:w-[90%]"
            data-about-reveal
          >
            <span className="ocTitle mb-2.5 block w-fit bg-acid px-2 font-scene text-[26px] font-bold text-ink -rotate-[4deg]">
              Meet my OC.
            </span>
            <span>
              Not much art yet. Not enough money, not enough spare time, haha. But of course they
              get a spot here.
            </span>
          </figcaption>
        </figure>
        <p
          className="marginNote absolute bottom-8 left-0 text-sm text-muted max-sm:bottom-[30px]"
          data-about-reveal
        >
          Still figuring things out. That’s allowed.
        </p>
      </section>

      <section
        className="research relative grid grid-cols-2 gap-[9%] px-[4%] pt-[30px] pb-[88px] max-md:gap-[6%] max-md:px-0 max-sm:grid-cols-1 max-sm:gap-8 max-sm:pb-10"
        aria-labelledby="research-heading"
      >
        <div>
          <h2
            className="font-scene text-[clamp(44px,4.9vw,70px)] leading-[1.04] font-bold tracking-[-0.055em] text-balance max-sm:text-[clamp(38px,8vw,60px)]"
            id="research-heading"
            data-about-reveal
          >
            Working with
            <br />
            the unknown.
          </h2>
          <p
            className="researchIntro mt-6 max-w-[265px] text-[19px] max-sm:max-w-[330px]"
            data-about-reveal
          >
            That’s the bit of machine learning that gets me.
          </p>
          <div
            className="equation mt-[72px] ml-[12%] flex w-fit flex-col items-center font-scene text-[clamp(25px,2.7vw,38px)] leading-[1.35] tracking-[-0.04em] -rotate-[7deg] max-md:ml-0 max-sm:mx-auto max-sm:mt-10"
            data-about-reveal
          >
            <span>a good idea</span>
            <span
              className="notEqual text-[92px] leading-[1.1] text-violet"
              aria-label="does not equal"
            >
              ≠
            </span>
            <span>a better result</span>
          </div>
          <p
            className="equationNote mt-[35px] ml-[24%] max-w-[210px] text-sm text-muted -rotate-[7deg] max-sm:mx-auto max-sm:mt-6"
            data-about-reveal
          >
            Unfortunately, the model didn’t get the memo.
          </p>
        </div>

        <div className="researchBody max-w-[440px] pt-16 text-[18px] leading-[1.8] [&_p+p]:mt-6 max-md:text-[17px] max-sm:max-w-full max-sm:pt-4">
          <p data-about-reveal>
            You build on things you don’t fully understand. Make a guess, run an experiment, take
            something out, try again. Little by little, you find out what holds up.
          </p>
          <p data-about-reveal>
            And sometimes a feature that makes perfect sense just… makes the result worse.
            Overfitting? Underfitting? Something else entirely? There are ways to investigate, but
            the result doesn’t come with an explanation.
          </p>
          <p className="researchAside text-violet" data-about-reveal>
            I can find out that I was wrong without finding out exactly why. Fascinating. Also kind
            of exhausting.
          </p>
          <div data-about-reveal>
            <EasedDetails
              className="researchMore mt-8 text-base [&>summary]:cursor-pointer [&>summary]:py-2.5 [&>summary]:underline [&>summary]:decoration-1 [&>summary]:underline-offset-[5px] [&>summary:focus-visible]:outline-3 [&>summary:focus-visible]:outline-offset-6 [&>summary:hover]:text-violet"
              contentClassName="researchMoreContent overflow-hidden"
              bodyClassName="researchMoreBody pt-5"
              summary="And then there’s the bigger question."
            >
              <p>
                I’m not really an XAI person, and figuring out AI’s internals isn’t what I’m setting
                out to do. Still, why do these models work as well as they do? Observing what
                happens as we scale them up isn’t quite the same as explaining it.
              </p>
              <p>
                Personally, I’m skeptical that autoregressive LLMs get us all the way to AGI or
                superintelligence. That doesn’t make their success any less real. And as a young
                researcher, I need results too. I don’t get to ignore a direction that works just
                because I have doubts.
              </p>
              <p>
                I admire Yann LeCun for standing by his convictions. He also has room to act on them
                that I don’t have. Being curious about a question and being able to make it your
                research are different things.
              </p>
              <p>Maybe I’ll see a satisfying explanation in my lifetime. I’d like that.</p>
            </EasedDetails>
          </div>
        </div>
      </section>

      <section
        id="off-the-clock"
        className="play relative grid scroll-mt-10 grid-cols-12 items-start gap-6 px-0 pt-14 pb-16 max-md:gap-x-4 max-sm:grid-cols-2 max-sm:gap-x-6 max-sm:gap-y-16 max-sm:pb-10"
        aria-labelledby="play-heading"
      >
        <div className="playHeading col-[2/12] mb-4 max-sm:col-[1/-1] max-sm:mb-0">
          <h2
            className="font-scene text-[clamp(44px,4.9vw,70px)] leading-[1.04] font-bold tracking-[-0.055em] text-balance max-sm:text-[clamp(38px,8vw,60px)]"
            id="play-heading"
            data-about-reveal
          >
            Off the clock,
            <br />
            all over the place.
          </h2>
          <p className="mt-5 text-[18px]" data-about-reveal>
            No research direction required.
          </p>
        </div>

        <div className="designFragment col-[2/6] row-start-2 mt-2 -rotate-[5deg] max-sm:col-[1/-1] max-sm:row-auto max-sm:ml-[5%]">
          <span
            className="typePlay mb-6 block w-fit bg-acid px-[18px] pb-2.5 font-scene text-[clamp(100px,13vw,180px)] leading-none font-extrabold tracking-[-0.09em] [clip-path:polygon(0_0,100%_0,100%_80%,84%_100%,0_100%)] max-sm:text-[120px]"
            aria-hidden="true"
            data-about-reveal
          >
            Aa
          </span>
          <h3
            className="font-scene text-[clamp(26px,3vw,42px)] leading-[1.1] font-bold tracking-[-0.045em] max-sm:text-[32px]"
            data-about-reveal
          >
            Graphic design
          </h3>
          <p className="mt-4 max-w-[320px] text-pretty" data-about-reveal>
            And making all sorts of strange little things.
          </p>
        </div>

        <div className="gamesFragment col-[8/13] row-start-2 mt-4 rotate-[4deg] pt-10 [&_h3+p]:mt-4 [&_p+p]:mt-2 [&_p+p]:text-sm [&_p+p]:text-muted max-sm:col-[1/-1] max-sm:row-auto max-sm:mr-[4%] max-sm:ml-[16%] max-sm:mt-0 max-sm:pt-0">
          <Image
            className="gameArt mb-5 block h-auto w-32 -rotate-[12deg]"
            src={controller}
            alt=""
            width={128}
            height={128}
            data-about-reveal
          />
          <h3
            className="font-scene text-[clamp(26px,3vw,42px)] leading-[1.1] font-bold tracking-[-0.045em] text-violet max-sm:text-[32px]"
            data-about-reveal
          >
            Some obscure
            <br />
            indie game.
          </h3>
          <p className="mt-4 max-w-[320px] text-pretty" data-about-reveal>
            Okay, not necessarily indie.
          </p>
          <p className="mt-4 max-w-[320px] text-pretty" data-about-reveal>
            Sometimes I just play games.
          </p>
        </div>

        <div className="routerFragment col-[2/6] row-start-3 mt-2 pl-3 max-sm:col-[1/-1] max-sm:row-auto max-sm:ml-[5%]">
          <Image
            className="networkArt mb-5 ml-6 block h-auto w-[140px] -rotate-[8deg]"
            src={antenna}
            alt=""
            width={140}
            height={140}
            data-about-reveal
          />
          <h3
            className="font-scene text-[clamp(26px,3vw,42px)] leading-[1.1] font-bold tracking-[-0.045em] max-sm:text-[32px]"
            data-about-reveal
          >
            The home router
          </h3>
          <p className="mt-4 max-w-[320px] text-pretty" data-about-reveal>
            Also something to tinker with.
          </p>
        </div>

        <div className="minecraftFragment col-[8/13] row-start-3 relative pt-[120px] -rotate-[3deg] max-sm:col-[1/-1] max-sm:row-auto max-sm:mr-[4%] max-sm:ml-[16%] max-sm:pt-[120px]">
          <Image
            className="pickArt absolute top-0 left-[60px] h-auto w-[110px]"
            src={pick}
            alt=""
            width={110}
            height={110}
            data-about-reveal
          />
          <h3
            className="font-scene text-[clamp(26px,3vw,42px)] leading-[1.1] font-bold tracking-[-0.045em] max-sm:text-[32px]"
            data-about-reveal
          >
            Minecraft
          </h3>
          <p className="mt-4 max-w-[320px] text-pretty" data-about-reveal>
            Playing it, sure.
            <br />
            Also poking around in the source code.
          </p>
        </div>

        <div className="chatFragment col-[5/11] row-start-4 mt-6 rotate-[3deg] border-l-2 border-violet pt-6 pl-8 max-sm:col-[1/-1] max-sm:row-auto max-sm:mr-[4%] max-sm:ml-[16%] max-sm:mt-0 max-sm:py-3 max-sm:pl-6">
          <h3
            className="font-scene text-[clamp(26px,3vw,42px)] leading-[1.1] font-bold tracking-[-0.045em] max-sm:text-[32px]"
            data-about-reveal
          >
            Or just
            <br />
            hanging out.
          </h3>
          <p className="mt-4 max-w-[320px] text-pretty" data-about-reveal>
            Chatting with friends online.
            <br />
            Not everything needs to turn into something.
          </p>
        </div>

        <div className="blogFragment col-[2/7] row-start-5 mt-2 text-[18px] max-sm:col-[1/-1] max-sm:row-auto max-sm:ml-[5%]">
          <p className="max-w-[320px] text-pretty" data-about-reveal>
            Sometimes I write things down.
          </p>
          <RouteLink className={inlineLink} href="/all" data-about-reveal>
            They end up on the blog.
          </RouteLink>
        </div>
      </section>

      <section
        className="goodbye relative pt-[72px] pr-0 pb-6 pl-[9%] max-sm:px-0 max-sm:pt-20 max-sm:pb-0"
        aria-labelledby="goodbye-heading"
      >
        <p className="mb-5 text-[18px]" data-about-reveal>
          Anyway. That’s a few pieces of me.
        </p>
        <h2
          className="max-w-[800px] font-scene text-[clamp(44px,4.9vw,70px)] leading-[1.04] font-bold tracking-[-0.055em] text-balance max-sm:text-[clamp(38px,8vw,60px)]"
          id="goodbye-heading"
          data-about-reveal
        >
          Not the whole picture.
        </h2>
        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-[17px]" data-about-reveal>
          <span>I’m leaving some room.</span>
          <RouteLink className={inlineLink} href="/contact">
            Say hi sometime.
          </RouteLink>
        </div>
      </section>
    </main>
  );
}
