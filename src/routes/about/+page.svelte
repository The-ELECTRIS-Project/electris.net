<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/stores/i18n';
  import { useHoverConfig } from '$lib/stores/hoverConfig';

  let visibleSections: Record<string, boolean> = {
    electris: false,
    electro: false,
    varrow: false
  };

  useHoverConfig([
    {
      type: ['h1', 'h2'],
      selectors: ['.main-title', '.electris-header', '.electro-header', '.varrow-header'],
      className: 'hovered-word-wrap',
      lockPosition: true,
      wrapText: {
        words: false,
        sentences: true,
        ignorePunctuation: true
      }
    }
  ]);

  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleSections[entry.target.id] = true;
        }
      });
    }, { threshold: 0.1 }); // Trigger earlier

    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });

    const cursorReset = () => {
      const cursor = document.querySelector('.circle');
      if (cursor) {
        cursor.className = "circle";
      }
    };
    setTimeout(cursorReset, 10);

    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <title>{$t('about.title', 'About Us')} | ELECTRIS</title>
</svelte:head>

<div class="page-container">
  <!-- Hero/Title -->
  <header class="page-header">
    <h1 class="main-title"><u>{$t('about.hero', 'About Us')}</u></h1>
  </header>
  
  <div class="content-wrapper">
    <!-- ELECTRIS SECTION -->
    <section id="electris" class:visible={visibleSections.electris} class="electris-section">
      <h2 class="section-title electris-header">{$t('about.elts.hero', 'About ELECTRIS')}</h2>
      <div class="content-text electris-text">
        <p class="intro">{$t('about.elts.intro', 'ELECTRIS is a group of and for creators.')}</p>
        <p>{$t('about.elts.p1', 'The ELECTRIS Project has the goal to let any person use their creativity however they wish, as that is undoubtedly the most unique trait that we have, and it should be allowed to flourish.')}</p>
        <p>{$t('about.elts.p2', 'It doesn\'t matter if it takes you a minute, an hour, a week or a whole year. What you create is yours. You should see your work through to the end, no matter how hard it is or how long it takes, because it is worth it, it\'s yours, and at the end of it all, you\'ll be proud of what you have made.')}</p>
        <p class="statement">{@html $t('about.elts.statement', 'That is what ELECTRIS stands for. <br> If it\'s what you stand for, then ELECTRIS is the right community for you.')}</p>
      </div>
    </section>

    <!-- ELECTRO SECTION -->
    <section id="electro" class:visible={visibleSections.electro} class="electro-section">
      <h2 class="section-title electro-header">{$t('about.eltr.hero', 'About ELECTRO')}</h2>
      <div class="content-text electro-text">
        <p class="intro">{$t('about.eltr.intro', 'ELECTRO is the founder of ELECTRIS, and the one writing this right now.')}</p>
        <p class="underintro">{$t('about.eltr.underintro', '(Hello, yes, that\'s me)')}</p>
        <div class="personal-block">
          <p>{$t('about.eltr.personal.p1', 'Well I guess I should write this in first person from now huh?')}</p>
          <p>{$t('about.eltr.personal.p2', 'Have you ever been asked to describe yourself and completely forgotten who you are? That\'s basically what I\'m going through right now. Anywho, I\'ll try my best to tell it right.')}</p>
        </div>
        <p>{$t('about.eltr.p1', 'I consider myself a creator. No, not a content creator, no, not an artist. a ')} <strong>{$t('about.eltr.creator', 'CREATOR')}</strong>{$t('about.eltr.p2', '. It means I like making things. No matter what they are. I like doing it because in the end, they are mine, I made them, I\'m proud of them, and no one can tell me otherwise.')}</p>
        <p>{$t('about.eltr.p3', 'And after that, I like sharing them. With friends, with family, with people I don\'t even know. I like when I get to share what I make and love it when it inspires others to make things too. Creating is my favourite thing in this world and I\'ll try as hard as I can to make that my reason for living.')}</p>
      </div>
    </section>

    <!-- VARROW SECTION -->
    <section id="varrow" class:visible={visibleSections.varrow} class="varrow-section">
      <h2 class="section-title varrow-header">{$t('about.vrrw.hero', 'About Varrow')}</h2>
      <div class="content-text varrow-text">
        <p class="intro">{$t('about.vrrw.intro', 'I asked him to write his own section, but all he said was:')}</p>
        <div class="terminal-block">
          <blockquote class="quote-text">
            {$t('about.vrrw.quote', '"Varrow is currently in hiding and doesn\'t want any information disclosed about him"')}
          </blockquote>
          <footer class="quote-author">{$t('site.author.vrrw', '- Varrow')}</footer>
        </div>
      </div>
    </section>
  </div>
  
  <div class="ambient-dots">
    <div class="ambient-dot dot-1"></div>
    <div class="ambient-dot dot-2"></div>
  </div>
</div>
  
<style>
  .page-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120px 20px 60px; /* Adjusted padding */
    position: relative;
    overflow-x: hidden;
  }

  /* Header */
  .page-header {
    margin-bottom: 4rem;
    text-align: center;
  }

  .main-title {
    font-family: 'Letric', sans-serif;
    font-size: 3.5rem;
    color: var(--color-primary);
    margin: 0;
  }

  /* Layout */
  .content-wrapper {
    width: 100%;
    max-width: 56.64vmin;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  section {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  }

  section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .section-title {
    font-family: 'Letric', sans-serif;
    font-size: 2.2rem;
    margin: 0 0 1rem 0;
    border-bottom: 2px solid;
    display: inline-block;
    padding-bottom: 0.2rem;
  }

  .content-text {
    font-family: 'Redwing', sans-serif;
    font-size: 1.15rem;
    line-height: 1.6;
    opacity: 0.9;
  }

  .content-text p {
    margin-bottom: 1rem;
    color: inherit;
  }

  /* --- ELECTRIS STYLES --- */
  .electris-section {
    color: var(--color-primary);
  }

  .electris-header {
    color: var(--color-electris);
    border-color: var(--color-electris);
  }

  .intro {
    font-weight: bold;
    font-size: 1.3rem;
  }

  .underintro {
    margin-top: -1.6vmin;
  }

  .statement {
    border-left: 3px solid var(--color-primary);
    padding-left: 1rem;
    font-style: italic;
    margin-top: 1.5rem;
  }


  /* --- ELECTRO STYLES --- */
  .electro-header {
    color: var(--color-electro);
    border-color: var(--color-electro);
  }
  
  .electro-text strong {
    color: var(--color-electro);
  }

  .personal-block {
    margin: 1.5rem 0;
    padding: 1rem;
    border-left: 1px dashed var(--color-electro);
    background: linear-gradient(90deg, rgba(0, 255, 170, 0.05), transparent);
  }


  /* --- VARROW STYLES --- */
  .varrow-header {
    color: var(--color-varrow);
    border-color: var(--color-varrow);
  }

  .terminal-block {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--color-varrow);
    padding: 1.5rem;
    margin-top: 1rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }

  .quote-text {
    color: var(--color-varrow);
    font-size: 1.1rem;
    margin: 0;
    font-style: italic;
  }

  .quote-author {
    color: var(--color-varrow);
    text-align: right;
    margin-top: 0.5rem;
    font-weight: bold;
    opacity: 0.8;
  }


  /* Ambient Dots (Subtler) */
  .ambient-dots {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: -1;
  }

  .ambient-dot {
    position: absolute;
    width: 2px;
    height: 2px;
    background: var(--color-primary);
    border-radius: 50%;
    opacity: 0.15; /* Reduced opacity */
  }

  .dot-1 { top: 15%; left: 5%; animation: float 15s infinite ease-in-out; }
  .dot-2 { bottom: 20%; right: 10%; animation: float 12s infinite ease-in-out reverse; }

  @keyframes float {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(15px, -15px); }
  }

  @media (max-width: 768px) {
    .page-container { padding-top: 100px; }
    .main-title { font-size: 2.5rem; }
    .section-title { font-size: 1.8rem; }
  }
</style>