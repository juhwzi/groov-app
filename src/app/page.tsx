import Link from "next/link";
import type { CSSProperties } from "react";
import { getCurrentUser } from "@/lib/auth";
import { Dashboard } from "@/components/Dashboard";
import { ScrollTopButton } from "@/components/ScrollTopButton";

const features = [
  {
    number: "01",
    icon: "◌",
    title: "Registre",
    text: "Transforme cada escuta em uma memória. Avalie álbuns, artistas e faixas e construa seu diário musical.",
  },
  {
    number: "02",
    icon: "✦",
    title: "Explore",
    text: "Descubra novos sons, artistas e álbuns a partir do que você realmente gosta de ouvir.",
  },
  {
    number: "03",
    icon: "∞",
    title: "Conecte",
    text: "Siga pessoas, compartilhe opiniões e acompanhe a cena musical da sua comunidade.",
  },
];

const sampleAlbums = [
  { title: "MADRUGADA 2H", artist: "Seu histórico", color: "#5f76a5", score: "5.0" },
  { title: "ÓRBITA", artist: "Sua descoberta", color: "#746ab0", score: "4.5" },
  { title: "NÉVOA AZUL", artist: "Na sua rotação", color: "#5aaed4", score: "4.0" },
  { title: "G-INFINITY", artist: "Nova obsessão", color: "#303b52", score: "4.5" },
];

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    return <Dashboard user={{ id: user.id, username: user.username, displayName: user.displayName }} />;
  }

  return (
    <main id="main-content" className="landing landingV2">
      <div className="landingNoise" aria-hidden="true" />
      <nav className="landingNav">
        <Link href="/" className="landingBrand" aria-label="Groov - início">
          <span className="landingLogoMark">∞</span>
          <span>GROOV</span>
        </Link>
        <div className="landingNavLinks" aria-label="Navegação principal">
          <a href="#sobre">Sobre</a>
          <a href="#recursos">Recursos</a>
          <a href="#comunidade">Comunidade</a>
        </div>
        <div className="landingNavActions">
          <Link href="/login" className="btn landingNavLogin">Entrar</Link>
          <Link href="/register" className="btn landingNavSignup">Criar conta <span>↗</span></Link>
        </div>
      </nav>

      <section className="landingHero landingHeroV2" id="sobre">
        <div className="landingHeroCopy">
          <div className="landingKicker"><span /> SOCIAL MUSIC JOURNAL</div>
          <h1>Seu gosto.<br /><em>Sua história.</em></h1>
          <p className="landingLead">
            Um espaço para registrar o que você ouve, descobrir o que vem depois e transformar sua relação com música em algo que pode ser lembrado.
          </p>
          <div className="landingCtas">
            <Link href="/register" className="btn landingPrimary">Começar no Groov <span>↗</span></Link>
            <Link href="/login" className="landingTextLink">Já tenho uma conta <span>→</span></Link>
          </div>
          <div className="landingHeroMeta">
            <span><b>∞</b> Seu diário musical</span>
            <span>•</span>
            <span>Ouça. Registre. Conecte.</span>
          </div>
        </div>

        <div className="landingVisual landingVisualV2" aria-label="Prévia da experiência Groov">
          <div className="visualHalo" />
          <div className="visualOrb orbOne" />
          <div className="visualOrb orbTwo" />
          <div className="groovBrowser">
            <div className="browserBar">
              <div className="browserDots"><i /><i /><i /></div>
              <div className="browserAddress">groov / diário</div>
              <span className="browserInfinity">∞</span>
            </div>
            <div className="browserContent">
              <aside className="browserSide">
                <div className="miniBrand"><span>∞</span> GROOV</div>
                <div className="miniNav active">▣ Diário</div>
                <div className="miniNav">◉ Descobrir</div>
                <div className="miniNav">♧ Comunidade</div>
                <div className="miniNav">▤ Listas</div>
              </aside>
              <div className="browserMain">
                <div className="browserEyebrow">SEU DIÁRIO</div>
                <div className="browserHeadingRow">
                  <div><h3>O que você ouviu?</h3><p>Seu histórico, sempre com você.</p></div>
                  <span className="browserBadge">ESTE MÊS</span>
                </div>
                <div className="albumStrip">
                  {sampleAlbums.map((album, index) => (
                    <div className="miniAlbum" key={album.title}>
                      <div className="miniAlbumArt" style={{ "--album-color": album.color } as CSSProperties}>
                        <span>{index === 3 ? "∞" : index + 1}</span>
                      </div>
                      <b>{album.title}</b>
                      <small>{album.artist}</small>
                    </div>
                  ))}
                </div>
                <div className="browserBottomGrid">
                  <div className="listenPanel">
                    <span className="panelLabel">ESCUTAS</span><strong>128</strong><small>+24 este mês</small>
                  </div>
                  <div className="listenPanel">
                    <span className="panelLabel">MÉDIA</span><strong>4.6</strong><small>suas avaliações</small>
                  </div>
                  <div className="listenPanel accentPanel">
                    <span className="panelLabel">EM ALTA</span><strong>∞</strong><small>seu gosto muda</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="floatingRecord"><span className="recordCenter">∞</span><span className="recordLine" /></div>
          <div className="floatingRating"><span>★★★★★</span><b>4.8</b><small>AVALIAÇÃO</small></div>
        </div>
      </section>

      <div className="landingTicker" aria-hidden="true">
        <span>LISTEN</span><b>∞</b><span>RATE</span><b>∞</b><span>DISCOVER</span><b>∞</b><span>CONNECT</span><b>∞</b><span>LISTEN</span><b>∞</b><span>RATE</span>
      </div>

      <section className="landingSection landingFeaturesV2" id="recursos">
        <div className="sectionIntro">
          <div className="landingKicker"><span /> COMO FUNCIONA</div>
          <h2>Não é só sobre<br /><em>ouvir música.</em></h2>
          <p>É sobre criar uma identidade musical que acompanha você.</p>
        </div>
        <div className="landingFeatureGrid landingFeatureGridV2">
          {features.map((feature) => (
            <article className="landingFeature landingFeatureV2" key={feature.number}>
              <div className="featureTop"><span className="featureNumber">{feature.number}</span><span className="landingFeatureIcon">{feature.icon}</span></div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <span className="featureArrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="landingSection identitySection">
        <div className="identityCard">
          <div className="identityCopy">
            <div className="landingKicker"><span /> SUA IDENTIDADE MUSICAL</div>
            <h2>O que você ouve<br />diz <em>muito</em> sobre você.</h2>
            <p>Do primeiro play à sua próxima obsessão: o Groov organiza seus momentos musicais para você olhar para trás, compartilhar e descobrir novas conexões.</p>
            <div className="identityStats">
              <div><strong>01</strong><span>Diário</span></div>
              <div><strong>∞</strong><span>Descobertas</span></div>
              <div><strong>24/7</strong><span>Seu gosto</span></div>
            </div>
          </div>
          <div className="identityArtwork" aria-hidden="true">
            <div className="vinyl vinylBack" /><div className="vinyl vinylMain"><div className="vinylLabel">∞<small>GROOV</small></div></div>
            <div className="artCard artOne"><span>GROOV</span><b>LISTEN<br />BETTER.</b></div>
            <div className="artCard artTwo"><span>∞</span><b>YOUR<br />TASTE.</b></div>
          </div>
        </div>
      </section>

      <section className="landingSection communitySection" id="comunidade">
        <div className="communityHeading">
          <div className="landingKicker"><span /> FEITO PARA COMPARTILHAR</div>
          <h2>Encontre quem<br /><em>ouve como você.</em></h2>
        </div>
        <div className="communityGrid">
          <div className="communityCard communityMainCard">
            <div className="communityIcon">∞</div>
            <div><strong>Comunidade musical</strong><p>Veja o que está tocando na sua rede, reaja às escutas e encontre novos perfis para acompanhar.</p></div>
            <span className="featureArrow">↗</span>
          </div>
          <div className="communityCard">
            <div className="stackedAvatars"><i>J</i><i>M</i><i>A</i><i>+</i></div>
            <strong>Seu círculo</strong><p>Amigos, descobertas e recomendações em um só lugar.</p>
          </div>
          <div className="communityCard darkCard">
            <span className="quoteMark">“</span><p>Seu gosto não precisa caber em um gênero.</p><small>GROOV / MANIFESTO</small>
          </div>
        </div>
      </section>

      <section className="landingBottomCta landingBottomCtaV2">
        <div className="ctaInfinity">∞</div>
        <div>
          <div className="landingKicker"><span /> COMEÇA AGORA</div>
          <h2>Seu próximo capítulo<br /><em>musical começa aqui.</em></h2>
          <p>Crie seu perfil gratuitamente e comece a registrar seu mundo sonoro.</p>
        </div>
        <Link href="/register" className="btn landingCtaButton">Criar minha conta <span>↗</span></Link>
      </section>

      <footer className="landingFooter landingFooterV2">
        <div className="footerBrand"><span>∞</span> GROOV</div>
        <div className="footerTagline">OUÇA. REGISTRE. CONECTE.</div>
        <div className="footerLinks"><a href="/login">Entrar</a><a href="/register">Criar conta</a><a href="/privacy">Privacidade</a><a href="/terms">Termos</a></div>
      </footer>
      <ScrollTopButton />
    </main>
  );
}
