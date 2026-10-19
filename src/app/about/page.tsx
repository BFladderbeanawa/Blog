import type { Metadata } from 'next';
import Image from 'next/image';
import antenna from '@/assets/about/satellite-antenna.svg';
import controller from '@/assets/about/video-game.svg';
import pick from '@/assets/about/pick.svg';
import illustration from '@/assets/illustration.png';
import geometry from '@/assets/ui/Group 150.svg';
import { RouteLink } from '@/components/site/Navigation';
import styles from './about.module.css';
import { AboutEntry } from './AboutEntry';
import { EasedDetails } from './EasedDetails';
import { SectionJump } from './SectionJump';

export const metadata: Metadata = {
  title: 'About',
  description:
    'BF, a little undefined. Machine learning, graphic design, an OC, and whatever else I feel like getting into.',
  alternates: { canonical: '/about' },
};

export default function About() {
  return (
    <main id="main-content" className={styles.room} data-about-page>
      <AboutEntry />
      <svg
        className={styles.thread}
        viewBox="0 0 1280 2800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          data-about-thread
          pathLength={1}
          d="M 30 350 C 180 100, 650 40, 1030 230 S 1230 700, 760 760 S 80 750, 130 1050 S 700 1400, 1020 1280 C 1340 1150, 1260 900, 1110 1060 S 910 1640, 570 1740 S -80 1770, 120 2050 S 1160 2020, 1090 2400 S 680 2640, 740 2800"
        />
      </svg>

      <section className={styles.hello} aria-labelledby="about-heading">
        <div className={styles.greeting}>
          <p className={styles.name} data-about-reveal>
            Hi, I’m BF.
          </p>
          <h1 id="about-heading" data-about-reveal>
            A little
            <br />
            undefined.
          </h1>
          <div className={styles.welcome} data-about-reveal>
            <p>BFladderbean works too.</p>
            <p>
              I research machine learning. Outside of that? A bit of everything, honestly. This is
              my little corner of the internet. Make yourself at home.
            </p>
          </div>
          <div data-about-reveal>
            <SectionJump className={styles.sideNote} sectionId="off-the-clock">
              <span>There’s more to life than the research bit.</span>
              <span className={styles.downArrow} aria-hidden="true">
                ↓
              </span>
            </SectionJump>
          </div>
          <Image
            src={geometry}
            alt=""
            width={220}
            height={220}
            className={styles.geometry}
            data-about-reveal
          />
        </div>

        <figure className={styles.oc}>
          <div className={styles.ocFrame} data-about-reveal>
            <Image
              src={illustration}
              alt="My original character, with white hair, pink eyes, cat ears, and a pink-and-violet outfit."
              sizes="(max-width: 760px) 88vw, (max-width: 1440px) 40vw, 560px"
              preload
            />
          </div>
          <figcaption data-about-reveal>
            <span className={styles.ocTitle}>Meet my OC.</span>
            <span>
              Not much art yet. Not enough money, not enough spare time, haha. But of course they
              get a spot here.
            </span>
          </figcaption>
        </figure>
        <p className={styles.marginNote} data-about-reveal>
          Still figuring things out. That’s allowed.
        </p>
      </section>

      <section className={styles.research} aria-labelledby="research-heading">
        <div className={styles.researchOpening}>
          <h2 id="research-heading" data-about-reveal>
            Working with
            <br />
            the unknown.
          </h2>
          <p className={styles.researchIntro} data-about-reveal>
            That’s the bit of machine learning that gets me.
          </p>
          <div className={styles.equation} data-about-reveal>
            <span>a good idea</span>
            <span className={styles.notEqual} aria-label="does not equal">
              ≠
            </span>
            <span>a better result</span>
          </div>
          <p className={styles.equationNote} data-about-reveal>
            Unfortunately, the model didn’t get the memo.
          </p>
        </div>

        <div className={styles.researchBody}>
          <p data-about-reveal>
            You build on things you don’t fully understand. Make a guess, run an experiment, take
            something out, try again. Little by little, you find out what holds up.
          </p>
          <p data-about-reveal>
            And sometimes a feature that makes perfect sense just… makes the result worse.
            Overfitting? Underfitting? Something else entirely? There are ways to investigate, but
            the result doesn’t come with an explanation.
          </p>
          <p className={styles.researchAside} data-about-reveal>
            I can find out that I was wrong without finding out exactly why. Fascinating. Also kind
            of exhausting.
          </p>
          <div data-about-reveal>
            <EasedDetails
              className={styles.researchMore}
              contentClassName={styles.researchMoreContent}
              bodyClassName={styles.researchMoreBody}
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

      <section id="off-the-clock" className={styles.play} aria-labelledby="play-heading">
        <div className={styles.playHeading}>
          <h2 id="play-heading" data-about-reveal>
            Off the clock,
            <br />
            all over the place.
          </h2>
          <p data-about-reveal>No research direction required.</p>
        </div>

        <div className={styles.designFragment}>
          <span className={styles.typePlay} aria-hidden="true" data-about-reveal>
            Aa
          </span>
          <h3 data-about-reveal>Graphic design</h3>
          <p data-about-reveal>And making all sorts of strange little things.</p>
        </div>

        <div className={styles.gamesFragment}>
          <Image
            src={controller}
            alt=""
            width={128}
            height={128}
            className={styles.gameArt}
            data-about-reveal
          />
          <h3 data-about-reveal>
            Some obscure
            <br />
            indie game.
          </h3>
          <p data-about-reveal>Okay, not necessarily indie.</p>
          <p data-about-reveal>Sometimes I just play games.</p>
        </div>

        <div className={styles.routerFragment}>
          <Image
            src={antenna}
            alt=""
            width={140}
            height={140}
            className={styles.networkArt}
            data-about-reveal
          />
          <h3 data-about-reveal>The home router</h3>
          <p data-about-reveal>Also something to tinker with.</p>
        </div>

        <div className={styles.minecraftFragment}>
          <Image
            src={pick}
            alt=""
            width={110}
            height={110}
            className={styles.pickArt}
            data-about-reveal
          />
          <h3 data-about-reveal>Minecraft</h3>
          <p data-about-reveal>
            Playing it, sure.
            <br />
            Also poking around in the source code.
          </p>
        </div>

        <div className={styles.chatFragment}>
          <h3 data-about-reveal>
            Or just
            <br />
            hanging out.
          </h3>
          <p data-about-reveal>
            Chatting with friends online.
            <br />
            Not everything needs to turn into something.
          </p>
        </div>

        <div className={styles.blogFragment} data-about-reveal>
          <p>Sometimes I write things down.</p>
          <RouteLink href="/all" className={styles.inlineLink}>
            They end up on the blog.
          </RouteLink>
        </div>
      </section>

      <section className={styles.goodbye} aria-labelledby="goodbye-heading">
        <p data-about-reveal>Anyway. That’s a few pieces of me.</p>
        <h2 id="goodbye-heading" data-about-reveal>
          Not the whole picture.
        </h2>
        <div data-about-reveal>
          <span>I’m leaving some room.</span>
          <RouteLink href="/contact" className={styles.inlineLink}>
            Say hi sometime.
          </RouteLink>
        </div>
      </section>
    </main>
  );
}
