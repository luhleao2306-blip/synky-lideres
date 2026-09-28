"use client";

import { ArrowUpRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DecisionPreview, MirrorPreview } from "@/components/public-experience-preview";

export default function PublicExperienceStudio() {
  return <section className="journey-studio" id="experimente" aria-labelledby="journey-studio-title">
    <Tabs defaultValue="decisions" orientation="vertical" className="journey-studio-tabs">
      <div className="journey-studio-copy">
        <span className="journey-eyebrow">EXPERIMENTE A SYNKY</span>
        <h2 id="journey-studio-title">Um primeiro passo.<br/><em>Na prática.</em></h2>
        <p>Escolha uma experiência e teste uma resposta.</p>
        <TabsList className="journey-studio-controls" aria-label="Escolha uma experiência para testar">
          <TabsTrigger value="decisions"><span>01</span><span><strong>Decisões Sob Pressão</strong><small>Uma escolha. Uma consequência.</small></span><ArrowUpRight size={18}/></TabsTrigger>
          <TabsTrigger value="mirror"><span>02</span><span><strong>Espelho do Líder</strong><small>Como você se percebe no dia a dia?</small></span><ArrowUpRight size={18}/></TabsTrigger>
        </TabsList>
        <a className="journey-studio-link" href="/experiencias">Explorar as 6 experiências <ArrowUpRight size={16}/></a>
      </div>
      <div className="journey-studio-stage">
        <TabsContent forceMount value="decisions" className="journey-studio-panel"><DecisionPreview/></TabsContent>
        <TabsContent forceMount value="mirror" className="journey-studio-panel"><MirrorPreview/></TabsContent>
      </div>
    </Tabs>
  </section>;
}
