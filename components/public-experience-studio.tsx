"use client";

import { ArrowUpRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DecisionPreview, MirrorPreview } from "@/components/public-experience-preview";

export default function PublicExperienceStudio({ id = "experimente" }: { id?: string }) {
  return <section className="journey-studio" id={id} aria-labelledby="journey-studio-title">
    <Tabs defaultValue="decisions" orientation="vertical" className="journey-studio-tabs">
      <div className="journey-studio-copy">
        <span className="journey-eyebrow">EXPERIMENTE A SYNKY</span>
        <h2 id="journey-studio-title">Um primeiro passo.<br/><em>Na prática.</em></h2>
        <p>Escolha uma experiência e teste uma resposta.</p>
        <TabsList className="journey-studio-controls" aria-label="Escolha uma experiência para testar">
          <TabsTrigger value="decisions" id={`${id}-tab-decisions`} aria-controls={`${id}-panel-decisions`}><span>01</span><span><strong>Decisões Sob Pressão</strong><small>Uma escolha. Uma consequência.</small></span><ArrowUpRight size={18}/></TabsTrigger>
          <TabsTrigger value="mirror" id={`${id}-tab-mirror`} aria-controls={`${id}-panel-mirror`}><span>02</span><span><strong>Espelho do Líder</strong><small>Como você se percebe no dia a dia?</small></span><ArrowUpRight size={18}/></TabsTrigger>
        </TabsList>
        <a className="journey-studio-link" href="/experiencias">Explorar as 6 experiências <ArrowUpRight size={16}/></a>
      </div>
      <div className="journey-studio-stage">
        <TabsContent id={`${id}-panel-decisions`} aria-labelledby={`${id}-tab-decisions`} forceMount value="decisions" className="journey-studio-panel"><DecisionPreview/></TabsContent>
        <TabsContent id={`${id}-panel-mirror`} aria-labelledby={`${id}-tab-mirror`} forceMount value="mirror" className="journey-studio-panel"><MirrorPreview/></TabsContent>
      </div>
    </Tabs>
  </section>;
}
